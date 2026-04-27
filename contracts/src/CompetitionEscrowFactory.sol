// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {CompetitionEscrow} from "./CompetitionEscrow.sol";

/// @title CompetitionEscrowFactory
/// @notice Deploys deterministic minimal-proxy clones of CompetitionEscrow,
///         one per competition. Acts as the on-chain registry via
///         `EscrowCreated` events.
contract CompetitionEscrowFactory is Ownable {
    /// @dev Hard cap on platform fee. Owner can lower below this; never raise above.
    uint16 public constant MAX_FEE_BPS = 1000; // 10%

    address public immutable implementation;
    address public feeRecipient;
    uint16 public feeBps;

    event EscrowCreated(
        address indexed escrow,
        address indexed organizer,
        bytes32 indexed competitionId,
        address token,
        uint16 feeBps,
        uint16[] prizeShareBps,
        uint64 submissionDeadline,
        uint64 expirationTimestamp
    );
    event FeeUpdated(uint16 newBps);
    event FeeRecipientUpdated(address indexed newRecipient);

    error FeeTooHigh();
    error ZeroAddress();
    error DeadlinesInvalid();

    constructor(address _implementation, address _feeRecipient, uint16 _feeBps)
        Ownable(msg.sender)
    {
        if (_implementation == address(0) || _feeRecipient == address(0)) revert ZeroAddress();
        if (_feeBps > MAX_FEE_BPS) revert FeeTooHigh();
        implementation = _implementation;
        feeRecipient = _feeRecipient;
        feeBps = _feeBps;
    }

    /// @notice Deploy a new escrow for a competition. The caller becomes the organizer.
    ///         The escrow snapshots the current platform fee and recipient at creation
    ///         time, so later changes by the factory owner do not affect existing escrows.
    /// @param competitionId Caller-chosen identifier (e.g., off-chain DB row id hashed).
    ///        Combined with the organizer address to derive the CREATE2 salt.
    /// @param prizeShareBps Prize-tier splits in basis points; must sum to 10_000.
    function createEscrow(
        bytes32 competitionId,
        address token,
        uint16[] calldata prizeShareBps,
        uint64 submissionDeadline,
        uint64 expirationTimestamp
    ) external returns (address escrow) {
        if (token == address(0)) revert ZeroAddress();
        if (
            submissionDeadline <= block.timestamp
                || expirationTimestamp <= submissionDeadline
        ) {
            revert DeadlinesInvalid();
        }

        bytes32 salt = _salt(msg.sender, competitionId);
        escrow = Clones.cloneDeterministic(implementation, salt);

        emit EscrowCreated(
            escrow,
            msg.sender,
            competitionId,
            token,
            feeBps,
            prizeShareBps,
            submissionDeadline,
            expirationTimestamp
        );

        CompetitionEscrow(escrow).initialize(
            token, msg.sender, feeRecipient, feeBps, prizeShareBps, submissionDeadline, expirationTimestamp
        );
    }

    /// @notice Predict the address of an escrow before it is deployed.
    function predictEscrow(address organizer, bytes32 competitionId)
        external
        view
        returns (address)
    {
        return Clones.predictDeterministicAddress(
            implementation, _salt(organizer, competitionId), address(this)
        );
    }

    function setFee(uint16 newBps) external onlyOwner {
        if (newBps > MAX_FEE_BPS) revert FeeTooHigh();
        feeBps = newBps;
        emit FeeUpdated(newBps);
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert ZeroAddress();
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }

    function _salt(address organizer, bytes32 competitionId) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(organizer, competitionId));
    }
}
