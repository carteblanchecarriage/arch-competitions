// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {CompetitionEscrow} from "../src/CompetitionEscrow.sol";
import {CompetitionEscrowFactory} from "../src/CompetitionEscrowFactory.sol";
import {MockERC20} from "./MockERC20.sol";

contract CompetitionEscrowFactoryTest is Test {
    CompetitionEscrow internal impl;
    CompetitionEscrowFactory internal factory;
    MockERC20 internal usdc;

    address internal owner = makeAddr("owner");
    address internal organizer = makeAddr("organizer");
    address internal feeRecipient = makeAddr("feeRecipient");
    address internal newRecipient = makeAddr("newRecipient");
    address internal alice = makeAddr("alice");

    uint16 internal constant FEE_BPS = 500;
    uint64 internal submissionDeadline;
    uint64 internal expirationTimestamp;

    uint16[] internal shares;

    function setUp() public {
        usdc = new MockERC20("USD Coin", "USDC", 6);
        impl = new CompetitionEscrow();

        vm.prank(owner);
        factory = new CompetitionEscrowFactory(address(impl), feeRecipient, FEE_BPS);

        submissionDeadline = uint64(block.timestamp + 30 days);
        expirationTimestamp = uint64(block.timestamp + 90 days);

        shares.push(6000);
        shares.push(3000);
        shares.push(1000);
    }

    // ──────────────────────────── constructor ─────────────────────────────

    function test_constructor_sets_state() public view {
        assertEq(factory.implementation(), address(impl));
        assertEq(factory.feeRecipient(), feeRecipient);
        assertEq(factory.feeBps(), FEE_BPS);
        assertEq(factory.owner(), owner);
    }

    function test_constructor_reverts_zero_implementation() public {
        vm.expectRevert(CompetitionEscrowFactory.ZeroAddress.selector);
        new CompetitionEscrowFactory(address(0), feeRecipient, FEE_BPS);
    }

    function test_constructor_reverts_zero_feeRecipient() public {
        vm.expectRevert(CompetitionEscrowFactory.ZeroAddress.selector);
        new CompetitionEscrowFactory(address(impl), address(0), FEE_BPS);
    }

    function test_constructor_reverts_fee_too_high() public {
        vm.expectRevert(CompetitionEscrowFactory.FeeTooHigh.selector);
        new CompetitionEscrowFactory(address(impl), feeRecipient, 1001);
    }

    // ─────────────────────────── createEscrow ─────────────────────────────

    function test_createEscrow_happy_path() public {
        bytes32 cid = keccak256("competition-1");
        address predicted = factory.predictEscrow(organizer, cid);

        vm.prank(organizer);
        address escrow =
            factory.createEscrow(cid, address(usdc), shares, submissionDeadline, expirationTimestamp);

        assertEq(escrow, predicted, "deterministic address mismatch");
        CompetitionEscrow e = CompetitionEscrow(escrow);
        assertEq(e.organizer(), organizer);
        assertEq(e.feeBps(), FEE_BPS);
        assertEq(e.feeRecipient(), feeRecipient);
        assertEq(e.prizeTierCount(), 3);
    }

    function test_createEscrow_same_id_different_organizers() public {
        bytes32 cid = keccak256("competition-1");
        address other = makeAddr("other");

        vm.prank(organizer);
        address a = factory.createEscrow(cid, address(usdc), shares, submissionDeadline, expirationTimestamp);

        vm.prank(other);
        address b = factory.createEscrow(cid, address(usdc), shares, submissionDeadline, expirationTimestamp);

        assertTrue(a != b, "different organizers must yield different addresses");
    }

    function test_createEscrow_reverts_zero_token() public {
        vm.prank(organizer);
        vm.expectRevert(CompetitionEscrowFactory.ZeroAddress.selector);
        factory.createEscrow(
            keccak256("c"), address(0), shares, submissionDeadline, expirationTimestamp
        );
    }

    function test_createEscrow_reverts_past_submission_deadline() public {
        vm.prank(organizer);
        vm.expectRevert(CompetitionEscrowFactory.DeadlinesInvalid.selector);
        factory.createEscrow(
            keccak256("c"), address(usdc), shares, uint64(block.timestamp), expirationTimestamp
        );
    }

    function test_createEscrow_reverts_expiration_before_submission() public {
        vm.prank(organizer);
        vm.expectRevert(CompetitionEscrowFactory.DeadlinesInvalid.selector);
        factory.createEscrow(
            keccak256("c"), address(usdc), shares, submissionDeadline, submissionDeadline - 1
        );
    }

    function test_createEscrow_reverts_duplicate() public {
        bytes32 cid = keccak256("competition-1");
        vm.prank(organizer);
        factory.createEscrow(cid, address(usdc), shares, submissionDeadline, expirationTimestamp);

        // CREATE2 collision: redeploying with same salt reverts
        vm.prank(organizer);
        vm.expectRevert();
        factory.createEscrow(cid, address(usdc), shares, submissionDeadline, expirationTimestamp);
    }

    // ──────────────── existing escrows snapshot params at creation ────────

    function test_existing_escrows_unaffected_by_factory_fee_change() public {
        bytes32 cid = keccak256("competition-1");
        vm.prank(organizer);
        address e1 = factory.createEscrow(cid, address(usdc), shares, submissionDeadline, expirationTimestamp);

        vm.prank(owner);
        factory.setFee(900);

        // First escrow keeps original fee
        assertEq(CompetitionEscrow(e1).feeBps(), FEE_BPS);

        // New escrow gets new fee
        bytes32 cid2 = keccak256("competition-2");
        vm.prank(organizer);
        address e2 = factory.createEscrow(cid2, address(usdc), shares, submissionDeadline, expirationTimestamp);
        assertEq(CompetitionEscrow(e2).feeBps(), 900);
    }

    function test_existing_escrows_unaffected_by_recipient_change() public {
        bytes32 cid = keccak256("competition-1");
        vm.prank(organizer);
        address e1 = factory.createEscrow(cid, address(usdc), shares, submissionDeadline, expirationTimestamp);

        vm.prank(owner);
        factory.setFeeRecipient(newRecipient);

        assertEq(CompetitionEscrow(e1).feeRecipient(), feeRecipient);
    }

    // ───────────────────────────── setFee ─────────────────────────────────

    function test_setFee_happy_path() public {
        vm.prank(owner);
        factory.setFee(700);
        assertEq(factory.feeBps(), 700);
    }

    function test_setFee_reverts_above_cap() public {
        vm.prank(owner);
        vm.expectRevert(CompetitionEscrowFactory.FeeTooHigh.selector);
        factory.setFee(1001);
    }

    function test_setFee_only_owner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        factory.setFee(700);
    }

    // ───────────────────────── setFeeRecipient ────────────────────────────

    function test_setFeeRecipient_happy_path() public {
        vm.prank(owner);
        factory.setFeeRecipient(newRecipient);
        assertEq(factory.feeRecipient(), newRecipient);
    }

    function test_setFeeRecipient_zero_reverts() public {
        vm.prank(owner);
        vm.expectRevert(CompetitionEscrowFactory.ZeroAddress.selector);
        factory.setFeeRecipient(address(0));
    }

    function test_setFeeRecipient_only_owner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        factory.setFeeRecipient(newRecipient);
    }
}
