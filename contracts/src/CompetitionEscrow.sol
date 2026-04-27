// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

/// @title CompetitionEscrow
/// @notice One escrow per competition. Holds ERC-20 prize funds (e.g., USDC on Base).
///
///         Design:
///         - Organizer commits to a prize structure in basis points at creation
///           (e.g., [6000, 3000, 1000] for a 60/30/10 split). Payout amounts are
///           derived from the final pool size, so open-pool growth scales every
///           prize proportionally.
///         - All transfers from the contract are pull-based: the fee recipient
///           gets paid in `announceWinners`, but winners and refundees pull their
///           own funds. No third party can initiate a transfer to anyone but
///           themselves.
///         - After `expirationTimestamp`, anyone can flip state to `Cancelled`
///           to unlock refunds (rescue path if the organizer disappears). This
///           transfers nothing on its own — contributors still pull their own
///           refunds via `claimRefund`.
contract CompetitionEscrow is Initializable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum State {
        Funding,
        Locked,
        Resolved,
        Cancelled
    }

    IERC20 public token;
    address public organizer;
    address public feeRecipient;
    uint16 public constant MAX_FEE_BPS = 1000;
    uint16 public feeBps;
    uint64 public submissionDeadline;
    uint64 public expirationTimestamp;
    State public state;

    /// @dev Prize tier shares in basis points; sums to 10_000. Length is the
    ///      number of prize tiers. Set once at initialization.
    uint16[] public prizeShareBps;

    uint256 public totalContributed;
    mapping(address contributor => uint256 amount) public contributions;
    mapping(address winner => uint256 amount) public prizeOf;

    event Funded(address indexed contributor, uint256 amount);
    event Locked();
    event WinnersAnnounced(address[] winners, uint256 platformFee, uint256 winnerShare);
    event PrizeClaimed(address indexed winner, uint256 amount);
    event Cancelled(address indexed by);
    event Refunded(address indexed contributor, uint256 amount);

    error InvalidState();
    error NotOrganizer();
    error ZeroAmount();
    error ZeroAddress();
    error EmptyShares();
    error SharesMustSumTo10000();
    error WinnerCountMismatch();
    error NoFunds();
    error NothingToClaim();
    error NothingToRefund();
    error TooEarly();
    error FeeTooHigh();
    error DeadlinesInvalid();

    modifier onlyOrganizer() {
        if (msg.sender != organizer) revert NotOrganizer();
        _;
    }

    /// @dev The implementation contract is never used directly; only clones
    ///      produced by the factory call `initialize`.
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _token,
        address _organizer,
        address _feeRecipient,
        uint16 _feeBps,
        uint16[] calldata _prizeShareBps,
        uint64 _submissionDeadline,
        uint64 _expirationTimestamp
    ) external initializer {
        if (_token == address(0) || _organizer == address(0) || _feeRecipient == address(0)) {
            revert ZeroAddress();
        }
        if (_feeBps > MAX_FEE_BPS) revert FeeTooHigh();
        if (_submissionDeadline <= block.timestamp || _expirationTimestamp <= _submissionDeadline) revert DeadlinesInvalid();
        if (_prizeShareBps.length == 0) revert EmptyShares();

        uint256 sum;
        for (uint256 i = 0; i < _prizeShareBps.length; i++) {
            if (_prizeShareBps[i] == 0) revert ZeroAmount();
            sum += _prizeShareBps[i];
            prizeShareBps.push(_prizeShareBps[i]);
        }
        if (sum != 10_000) revert SharesMustSumTo10000();

        token = IERC20(_token);
        organizer = _organizer;
        feeRecipient = _feeRecipient;
        feeBps = _feeBps;
        submissionDeadline = _submissionDeadline;
        expirationTimestamp = _expirationTimestamp;
        state = State.Funding;
    }

    /// @notice Number of prize tiers committed to at creation.
    function prizeTierCount() external view returns (uint256) {
        return prizeShareBps.length;
    }

    /// @notice Contribute prize money. Anyone can contribute (open pool).
    ///         Caller must approve `amount` of token to this contract first.
    function fund(uint256 amount) external nonReentrant {
        if (state != State.Funding) revert InvalidState();
        if (amount == 0) revert ZeroAmount();

        uint256 beforeBalance = token.balanceOf(address(this));
        token.safeTransferFrom(msg.sender, address(this), amount);
        uint256 afterBalance = token.balanceOf(address(this));

        uint256 received = afterBalance - beforeBalance;
        if (received == 0) revert ZeroAmount();

        contributions[msg.sender] += received;
        totalContributed += received;

        emit Funded(msg.sender, received);
    }

    /// @notice Optional: organizer freezes contributions before judging.
    ///         `announceWinners` works directly from `Funding` if not called.
    function lock() external onlyOrganizer {
        if (state != State.Funding) revert InvalidState();
        state = State.Locked;
        emit Locked();
    }

    /// @notice Organizer assigns winners to the prize tiers. Amounts are derived
    ///         from `totalContributed` and the committed `prizeShareBps`. Fee is
    ///         pushed to the platform; winner amounts are credited internally
    ///         and pulled by each winner via `claimPrize`.
    /// @param winners One address per prize tier, in tier order.
    function announceWinners(address[] calldata winners) external onlyOrganizer nonReentrant {
        if (state != State.Funding && state != State.Locked) revert InvalidState();
        if (winners.length != prizeShareBps.length) revert WinnerCountMismatch();
        if (totalContributed == 0) revert NoFunds();

        for (uint256 i = 0; i < winners.length; i++) {
            if (winners[i] == address(0)) revert ZeroAddress();
        }

        uint256 total = totalContributed;
        uint256 fee = (total * feeBps) / 10_000;
        uint256 winnerShare = total - fee;

        // Effects: allocate prize balances. Last winner absorbs rounding dust
        // so the sum of allocations exactly equals winnerShare.
        uint256 distributed;
        uint256 lastIdx = winners.length - 1;
        for (uint256 i = 0; i < lastIdx; i++) {
            uint256 amount = (winnerShare * prizeShareBps[i]) / 10_000;
            prizeOf[winners[i]] += amount; // += handles same-address-multiple-tiers
            distributed += amount;
        }
        prizeOf[winners[lastIdx]] += winnerShare - distributed;

        state = State.Resolved;

        // Interactions: only the platform fee is pushed; winners pull their own.
        if (fee > 0) token.safeTransfer(feeRecipient, fee);

        emit WinnersAnnounced(winners, fee, winnerShare);
    }

    /// @notice Winner pulls their allocated prize. Pull pattern protects against
    ///         a blocklisted/reverting winner blocking the rest of the payout.
    function claimPrize() external nonReentrant {
        if (state != State.Resolved) revert InvalidState();
        uint256 amount = prizeOf[msg.sender];
        if (amount == 0) revert NothingToClaim();

        prizeOf[msg.sender] = 0;
        token.safeTransfer(msg.sender, amount);

        emit PrizeClaimed(msg.sender, amount);
    }

    /// @notice Move the escrow into `Cancelled` state. State change only —
    ///         transfers nothing. After this, contributors call `claimRefund`
    ///         themselves to recover their own funds.
    ///
    ///         Two callers permitted:
    ///         - The organizer, any time before resolution.
    ///         - Anyone, after `expirationTimestamp` (rescue path).
    function cancel() external {
        if (state != State.Funding && state != State.Locked) revert InvalidState();
        if (msg.sender != organizer) {
            if (block.timestamp < expirationTimestamp) revert TooEarly();
        }
        state = State.Cancelled;
        emit Cancelled(msg.sender);
    }

    /// @notice Each contributor pulls their own refund after cancellation.
    ///         Caller can only refund their own `contributions` balance.
    function claimRefund() external nonReentrant {
        if (state != State.Cancelled) revert InvalidState();
        uint256 amount = contributions[msg.sender];
        if (amount == 0) revert NothingToRefund();

        contributions[msg.sender] = 0;
        token.safeTransfer(msg.sender, amount);

        emit Refunded(msg.sender, amount);
    }
}
