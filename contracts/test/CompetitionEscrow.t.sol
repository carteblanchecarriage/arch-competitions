// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {CompetitionEscrow} from "../src/CompetitionEscrow.sol";
import {MockERC20} from "./MockERC20.sol";

contract FeeOnTransferERC20 is ERC20 {
    uint8 private immutable _decimals;
    uint16 public feeBps;

    constructor(string memory name_, string memory symbol_, uint8 decimals_, uint16 feeBps_) ERC20(name_, symbol_) {
        _decimals = decimals_;
        feeBps = feeBps_;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal override {
        uint256 fee = (amount * feeBps) / 10_000;
        uint256 net = amount - fee;
        super._transfer(from, to, net);
        if (fee > 0) {
            _burn(from, fee);
        }
    }
}

contract CompetitionEscrowTest is Test {
    CompetitionEscrow internal impl;
    CompetitionEscrow internal escrow;
    MockERC20 internal usdc;

    address internal organizer = makeAddr("organizer");
    address internal feeRecipient = makeAddr("feeRecipient");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");
    address internal carol = makeAddr("carol");
    address internal first = makeAddr("first");
    address internal second = makeAddr("second");
    address internal third = makeAddr("third");

    uint16 internal constant FEE_BPS = 500; // 5%
    uint64 internal submissionDeadline;
    uint64 internal expirationTimestamp;

    // 60/30/10 split
    uint16[] internal shares;

    function setUp() public {
        usdc = new MockERC20("USD Coin", "USDC", 6);
        impl = new CompetitionEscrow();

        submissionDeadline = uint64(block.timestamp + 30 days);
        expirationTimestamp = uint64(block.timestamp + 90 days);

        shares.push(6000);
        shares.push(3000);
        shares.push(1000);

        escrow = _deployEscrow(shares);
        _seed(alice, 10_000e6);
        _seed(bob, 10_000e6);
        _seed(carol, 10_000e6);
    }

    function _deployEscrow(uint16[] memory _shares) internal returns (CompetitionEscrow e) {
        address clone = Clones.clone(address(impl));
        e = CompetitionEscrow(clone);
        e.initialize(
            address(usdc), organizer, feeRecipient, FEE_BPS, _shares, submissionDeadline, expirationTimestamp
        );
    }

    function _seed(address who, uint256 amount) internal {
        usdc.mint(who, amount);
        vm.prank(who);
        usdc.approve(address(escrow), type(uint256).max);
    }

    // ───────────────────────── initialization ──────────────────────────

    function test_implementation_cannot_be_initialized() public {
        uint16[] memory s = new uint16[](1);
        s[0] = 10_000;
        vm.expectRevert(Initializable.InvalidInitialization.selector);
        impl.initialize(address(usdc), organizer, feeRecipient, FEE_BPS, s, submissionDeadline, expirationTimestamp);
    }

    function test_initialize_cannot_be_called_twice() public {
        uint16[] memory s = new uint16[](1);
        s[0] = 10_000;
        vm.expectRevert(Initializable.InvalidInitialization.selector);
        escrow.initialize(address(usdc), organizer, feeRecipient, FEE_BPS, s, submissionDeadline, expirationTimestamp);
    }

    function test_initialize_reverts_zero_token() public {
        address clone = Clones.clone(address(impl));
        vm.expectRevert(CompetitionEscrow.ZeroAddress.selector);
        CompetitionEscrow(clone).initialize(
            address(0), organizer, feeRecipient, FEE_BPS, shares, submissionDeadline, expirationTimestamp
        );
    }

    function test_initialize_reverts_zero_organizer() public {
        address clone = Clones.clone(address(impl));
        vm.expectRevert(CompetitionEscrow.ZeroAddress.selector);
        CompetitionEscrow(clone).initialize(
            address(usdc), address(0), feeRecipient, FEE_BPS, shares, submissionDeadline, expirationTimestamp
        );
    }

    function test_initialize_reverts_empty_shares() public {
        address clone = Clones.clone(address(impl));
        uint16[] memory empty = new uint16[](0);
        vm.expectRevert(CompetitionEscrow.EmptyShares.selector);
        CompetitionEscrow(clone).initialize(
            address(usdc), organizer, feeRecipient, FEE_BPS, empty, submissionDeadline, expirationTimestamp
        );
    }

    function test_initialize_reverts_shares_dont_sum_to_10000() public {
        address clone = Clones.clone(address(impl));
        uint16[] memory bad = new uint16[](2);
        bad[0] = 5000;
        bad[1] = 4000;
        vm.expectRevert(CompetitionEscrow.SharesMustSumTo10000.selector);
        CompetitionEscrow(clone).initialize(
            address(usdc), organizer, feeRecipient, FEE_BPS, bad, submissionDeadline, expirationTimestamp
        );
    }

    function test_initialize_reverts_zero_share() public {
        address clone = Clones.clone(address(impl));
        uint16[] memory bad = new uint16[](2);
        bad[0] = 10_000;
        bad[1] = 0;
        vm.expectRevert(CompetitionEscrow.ZeroAmount.selector);
        CompetitionEscrow(clone).initialize(
            address(usdc), organizer, feeRecipient, FEE_BPS, bad, submissionDeadline, expirationTimestamp
        );
    }

    function test_initialize_reverts_fee_too_high() public {
        address clone = Clones.clone(address(impl));
        uint16[] memory s = new uint16[](1);
        s[0] = 10_000;

        vm.expectRevert(CompetitionEscrow.FeeTooHigh.selector);
        CompetitionEscrow(clone).initialize(
            address(usdc), organizer, feeRecipient, 1001, s, submissionDeadline, expirationTimestamp
        );
    }

    function test_initialize_reverts_invalid_deadlines() public {
        address clone = Clones.clone(address(impl));
        uint16[] memory s = new uint16[](1);
        s[0] = 10_000;

        vm.expectRevert(CompetitionEscrow.DeadlinesInvalid.selector);
        CompetitionEscrow(clone).initialize(
            address(usdc), organizer, feeRecipient, FEE_BPS, s, uint64(block.timestamp), expirationTimestamp
        );
    }

    function test_initialize_stores_state_correctly() public view {
        assertEq(address(escrow.token()), address(usdc));
        assertEq(escrow.organizer(), organizer);
        assertEq(escrow.feeRecipient(), feeRecipient);
        assertEq(escrow.feeBps(), FEE_BPS);
        assertEq(escrow.submissionDeadline(), submissionDeadline);
        assertEq(escrow.expirationTimestamp(), expirationTimestamp);
        assertEq(uint256(escrow.state()), uint256(CompetitionEscrow.State.Funding));
        assertEq(escrow.prizeTierCount(), 3);
        assertEq(escrow.prizeShareBps(0), 6000);
    }

    // ───────────────────────────── fund ─────────────────────────────────

    function test_fund_happy_path() public {
        vm.prank(alice);
        escrow.fund(1_000e6);

        assertEq(escrow.contributions(alice), 1_000e6);
        assertEq(escrow.totalContributed(), 1_000e6);
        assertEq(usdc.balanceOf(address(escrow)), 1_000e6);
    }

    function test_fund_multiple_contributors_accumulate() public {
        vm.prank(alice);
        escrow.fund(1_000e6);
        vm.prank(bob);
        escrow.fund(500e6);
        vm.prank(alice);
        escrow.fund(200e6);

        assertEq(escrow.contributions(alice), 1_200e6);
        assertEq(escrow.contributions(bob), 500e6);
        assertEq(escrow.totalContributed(), 1_700e6);
    }

    function test_fund_reverts_zero_amount() public {
        vm.prank(alice);
        vm.expectRevert(CompetitionEscrow.ZeroAmount.selector);
        escrow.fund(0);
    }

    function test_fund_accounts_actual_received_amount_when_token_charges_fees() public {
        FeeOnTransferERC20 feeToken = new FeeOnTransferERC20("Fee Token", "FEE", 6, 500);
        address clone = Clones.clone(address(impl));
        CompetitionEscrow feeEscrow = CompetitionEscrow(clone);

        uint16[] memory s = new uint16[](1);
        s[0] = 10_000;
        feeEscrow.initialize(address(feeToken), organizer, feeRecipient, FEE_BPS, s, submissionDeadline, expirationTimestamp);

        feeToken.mint(alice, 10_000e6);
        vm.prank(alice);
        feeToken.approve(address(feeEscrow), type(uint256).max);

        vm.prank(alice);
        feeEscrow.fund(10_000e6);

        uint256 expectedReceived = 9_500e6;
        assertEq(feeEscrow.contributions(alice), expectedReceived);
        assertEq(feeEscrow.totalContributed(), expectedReceived);
        assertEq(feeToken.balanceOf(address(feeEscrow)), expectedReceived);
    }

    function test_fund_reverts_when_locked() public {
        vm.prank(organizer);
        escrow.lock();

        vm.prank(alice);
        vm.expectRevert(CompetitionEscrow.InvalidState.selector);
        escrow.fund(1_000e6);
    }

    // ────────────────────────────── lock ────────────────────────────────

    function test_lock_only_organizer() public {
        vm.prank(alice);
        vm.expectRevert(CompetitionEscrow.NotOrganizer.selector);
        escrow.lock();
    }

    function test_lock_transitions_state() public {
        vm.prank(organizer);
        escrow.lock();
        assertEq(uint256(escrow.state()), uint256(CompetitionEscrow.State.Locked));
    }

    function test_lock_reverts_if_not_funding() public {
        vm.prank(organizer);
        escrow.lock();
        vm.prank(organizer);
        vm.expectRevert(CompetitionEscrow.InvalidState.selector);
        escrow.lock();
    }

    // ──────────────────────── announceWinners ───────────────────────────

    function test_announceWinners_happy_path() public {
        // pool = 10_000 USDC, fee = 5% = 500, winnerShare = 9_500
        // 60/30/10 → 5_700 / 2_850 / 950
        vm.prank(alice);
        escrow.fund(10_000e6);

        address[] memory winners = new address[](3);
        winners[0] = first;
        winners[1] = second;
        winners[2] = third;

        vm.prank(organizer);
        escrow.announceWinners(winners);

        assertEq(uint256(escrow.state()), uint256(CompetitionEscrow.State.Resolved));
        assertEq(escrow.prizeOf(first), 5_700e6);
        assertEq(escrow.prizeOf(second), 2_850e6);
        assertEq(escrow.prizeOf(third), 950e6);
        assertEq(usdc.balanceOf(feeRecipient), 500e6);
    }

    function test_announceWinners_only_organizer() public {
        vm.prank(alice);
        escrow.fund(10_000e6);

        address[] memory winners = new address[](3);
        winners[0] = first;
        winners[1] = second;
        winners[2] = third;

        vm.prank(alice);
        vm.expectRevert(CompetitionEscrow.NotOrganizer.selector);
        escrow.announceWinners(winners);
    }

    function test_announceWinners_reverts_winner_count_mismatch() public {
        vm.prank(alice);
        escrow.fund(10_000e6);

        address[] memory winners = new address[](2);
        winners[0] = first;
        winners[1] = second;

        vm.prank(organizer);
        vm.expectRevert(CompetitionEscrow.WinnerCountMismatch.selector);
        escrow.announceWinners(winners);
    }

    function test_announceWinners_reverts_zero_address_winner() public {
        vm.prank(alice);
        escrow.fund(10_000e6);

        address[] memory winners = new address[](3);
        winners[0] = first;
        winners[1] = address(0);
        winners[2] = third;

        vm.prank(organizer);
        vm.expectRevert(CompetitionEscrow.ZeroAddress.selector);
        escrow.announceWinners(winners);
    }

    function test_announceWinners_reverts_no_funds() public {
        address[] memory winners = new address[](3);
        winners[0] = first;
        winners[1] = second;
        winners[2] = third;

        vm.prank(organizer);
        vm.expectRevert(CompetitionEscrow.NoFunds.selector);
        escrow.announceWinners(winners);
    }

    function test_announceWinners_rounding_dust_goes_to_last_winner() public {
        // Pool that doesn't divide cleanly: 1001 wei (USDC 6dp), feeBps 0 to keep math focused
        uint16[] memory s = new uint16[](3);
        s[0] = 6000;
        s[1] = 3000;
        s[2] = 1000;

        address clone = Clones.clone(address(impl));
        CompetitionEscrow rd = CompetitionEscrow(clone);
        rd.initialize(address(usdc), organizer, feeRecipient, 0, s, submissionDeadline, expirationTimestamp);

        usdc.mint(alice, 1001);
        vm.prank(alice);
        usdc.approve(address(rd), 1001);
        vm.prank(alice);
        rd.fund(1001);

        address[] memory winners = new address[](3);
        winners[0] = first;
        winners[1] = second;
        winners[2] = third;

        vm.prank(organizer);
        rd.announceWinners(winners);

        // 1001 * 6000 / 10000 = 600
        // 1001 * 3000 / 10000 = 300
        // remainder: 1001 - 600 - 300 = 101  (last winner absorbs)
        assertEq(rd.prizeOf(first), 600);
        assertEq(rd.prizeOf(second), 300);
        assertEq(rd.prizeOf(third), 101);
        // total allocations exactly equal pool (zero fee in this test)
        assertEq(rd.prizeOf(first) + rd.prizeOf(second) + rd.prizeOf(third), 1001);
    }

    function test_announceWinners_zero_fee_path() public {
        uint16[] memory s = new uint16[](1);
        s[0] = 10_000;

        address clone = Clones.clone(address(impl));
        CompetitionEscrow zf = CompetitionEscrow(clone);
        zf.initialize(address(usdc), organizer, feeRecipient, 0, s, submissionDeadline, expirationTimestamp);

        usdc.mint(alice, 1_000e6);
        vm.prank(alice);
        usdc.approve(address(zf), 1_000e6);
        vm.prank(alice);
        zf.fund(1_000e6);

        address[] memory winners = new address[](1);
        winners[0] = first;

        vm.prank(organizer);
        zf.announceWinners(winners);

        assertEq(zf.prizeOf(first), 1_000e6);
        assertEq(usdc.balanceOf(feeRecipient), 0);
    }

    function test_announceWinners_works_from_locked_state() public {
        vm.prank(alice);
        escrow.fund(10_000e6);
        vm.prank(organizer);
        escrow.lock();

        address[] memory winners = new address[](3);
        winners[0] = first;
        winners[1] = second;
        winners[2] = third;

        vm.prank(organizer);
        escrow.announceWinners(winners);

        assertEq(uint256(escrow.state()), uint256(CompetitionEscrow.State.Resolved));
    }

    function test_announceWinners_same_address_multiple_tiers() public {
        vm.prank(alice);
        escrow.fund(10_000e6);

        address[] memory winners = new address[](3);
        winners[0] = first;
        winners[1] = first; // same person wins 1st and 2nd
        winners[2] = third;

        vm.prank(organizer);
        escrow.announceWinners(winners);

        assertEq(escrow.prizeOf(first), 5_700e6 + 2_850e6);
        assertEq(escrow.prizeOf(third), 950e6);
    }

    // ───────────────────────────── claimPrize ───────────────────────────

    function test_claimPrize_happy_path() public {
        vm.prank(alice);
        escrow.fund(10_000e6);

        address[] memory winners = new address[](3);
        winners[0] = first;
        winners[1] = second;
        winners[2] = third;

        vm.prank(organizer);
        escrow.announceWinners(winners);

        vm.prank(first);
        escrow.claimPrize();
        assertEq(usdc.balanceOf(first), 5_700e6);
        assertEq(escrow.prizeOf(first), 0);
    }

    function test_claimPrize_double_claim_reverts() public {
        vm.prank(alice);
        escrow.fund(10_000e6);

        address[] memory winners = new address[](3);
        winners[0] = first;
        winners[1] = second;
        winners[2] = third;

        vm.prank(organizer);
        escrow.announceWinners(winners);

        vm.prank(first);
        escrow.claimPrize();
        vm.prank(first);
        vm.expectRevert(CompetitionEscrow.NothingToClaim.selector);
        escrow.claimPrize();
    }

    function test_claimPrize_non_winner_reverts() public {
        vm.prank(alice);
        escrow.fund(10_000e6);

        address[] memory winners = new address[](3);
        winners[0] = first;
        winners[1] = second;
        winners[2] = third;

        vm.prank(organizer);
        escrow.announceWinners(winners);

        vm.prank(alice);
        vm.expectRevert(CompetitionEscrow.NothingToClaim.selector);
        escrow.claimPrize();
    }

    function test_claimPrize_reverts_if_not_resolved() public {
        vm.prank(first);
        vm.expectRevert(CompetitionEscrow.InvalidState.selector);
        escrow.claimPrize();
    }

    // ────────────────────────────── cancel ──────────────────────────────

    function test_cancel_organizer_anytime() public {
        vm.prank(alice);
        escrow.fund(1_000e6);

        vm.prank(organizer);
        escrow.cancel();

        assertEq(uint256(escrow.state()), uint256(CompetitionEscrow.State.Cancelled));
    }

    function test_cancel_non_organizer_before_expiration_reverts() public {
        vm.prank(alice);
        escrow.fund(1_000e6);

        vm.prank(bob);
        vm.expectRevert(CompetitionEscrow.TooEarly.selector);
        escrow.cancel();
    }

    function test_cancel_anyone_after_expiration() public {
        vm.prank(alice);
        escrow.fund(1_000e6);

        vm.warp(expirationTimestamp + 1);

        vm.prank(bob);
        escrow.cancel();
        assertEq(uint256(escrow.state()), uint256(CompetitionEscrow.State.Cancelled));
    }

    function test_cancel_does_not_transfer_funds() public {
        vm.prank(alice);
        escrow.fund(1_000e6);

        uint256 escrowBalBefore = usdc.balanceOf(address(escrow));
        uint256 attackerBalBefore = usdc.balanceOf(bob);

        vm.warp(expirationTimestamp + 1);
        vm.prank(bob);
        escrow.cancel();

        assertEq(usdc.balanceOf(address(escrow)), escrowBalBefore, "escrow balance must not change");
        assertEq(usdc.balanceOf(bob), attackerBalBefore, "rescuer must not receive funds");
    }

    function test_cancel_reverts_if_resolved() public {
        vm.prank(alice);
        escrow.fund(1_000e6);

        address[] memory winners = new address[](3);
        winners[0] = first;
        winners[1] = second;
        winners[2] = third;
        vm.prank(organizer);
        escrow.announceWinners(winners);

        vm.prank(organizer);
        vm.expectRevert(CompetitionEscrow.InvalidState.selector);
        escrow.cancel();
    }

    // ─────────────────────────── claimRefund ────────────────────────────

    function test_claimRefund_happy_path() public {
        vm.prank(alice);
        escrow.fund(1_000e6);
        vm.prank(bob);
        escrow.fund(500e6);

        vm.prank(organizer);
        escrow.cancel();

        uint256 aliceBefore = usdc.balanceOf(alice);
        vm.prank(alice);
        escrow.claimRefund();
        assertEq(usdc.balanceOf(alice), aliceBefore + 1_000e6);
        assertEq(escrow.contributions(alice), 0);

        uint256 bobBefore = usdc.balanceOf(bob);
        vm.prank(bob);
        escrow.claimRefund();
        assertEq(usdc.balanceOf(bob), bobBefore + 500e6);
    }

    function test_claimRefund_double_claim_reverts() public {
        vm.prank(alice);
        escrow.fund(1_000e6);
        vm.prank(organizer);
        escrow.cancel();

        vm.prank(alice);
        escrow.claimRefund();
        vm.prank(alice);
        vm.expectRevert(CompetitionEscrow.NothingToRefund.selector);
        escrow.claimRefund();
    }

    function test_claimRefund_non_contributor_reverts() public {
        vm.prank(alice);
        escrow.fund(1_000e6);
        vm.prank(organizer);
        escrow.cancel();

        vm.prank(carol);
        vm.expectRevert(CompetitionEscrow.NothingToRefund.selector);
        escrow.claimRefund();
    }

    function test_claimRefund_reverts_if_not_cancelled() public {
        vm.prank(alice);
        escrow.fund(1_000e6);

        vm.prank(alice);
        vm.expectRevert(CompetitionEscrow.InvalidState.selector);
        escrow.claimRefund();
    }

    // ─────────────────────────── invariants ─────────────────────────────

    function testFuzz_fee_math_within_cap(uint256 amount, uint16 fee) public {
        amount = bound(amount, 1e6, 1_000_000e6);
        fee = uint16(bound(fee, 0, 1000)); // up to 10% (factory cap)

        uint16[] memory s = new uint16[](1);
        s[0] = 10_000;
        address clone = Clones.clone(address(impl));
        CompetitionEscrow e = CompetitionEscrow(clone);
        e.initialize(address(usdc), organizer, feeRecipient, fee, s, submissionDeadline, expirationTimestamp);

        usdc.mint(alice, amount);
        vm.prank(alice);
        usdc.approve(address(e), amount);
        vm.prank(alice);
        e.fund(amount);

        address[] memory winners = new address[](1);
        winners[0] = first;

        vm.prank(organizer);
        e.announceWinners(winners);

        uint256 expectedFee = (amount * fee) / 10_000;
        uint256 expectedWinner = amount - expectedFee;

        assertEq(usdc.balanceOf(feeRecipient), expectedFee);
        assertEq(e.prizeOf(first), expectedWinner);
        // total accounting: fee paid + winner allocation == pool
        assertEq(usdc.balanceOf(feeRecipient) + e.prizeOf(first), amount);
    }
}
