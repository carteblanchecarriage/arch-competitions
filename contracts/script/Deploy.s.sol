// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {CompetitionEscrow} from "../src/CompetitionEscrow.sol";
import {CompetitionEscrowFactory} from "../src/CompetitionEscrowFactory.sol";

/// @notice Deploys CompetitionEscrow (implementation) and CompetitionEscrowFactory.
///
/// Required env vars:
///   PRIVATE_KEY      — deployer key (will become factory owner)
///   FEE_RECIPIENT    — address that receives platform fees
///
/// Optional env vars:
///   FEE_BPS          — platform fee in basis points (default 500 = 5%)
///
/// Example (Base Sepolia):
///   forge script script/Deploy.s.sol:Deploy --rpc-url base_sepolia --broadcast --verify
contract Deploy is Script {
    function run() external returns (CompetitionEscrow impl, CompetitionEscrowFactory factory) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address feeRecipient = vm.envAddress("FEE_RECIPIENT");
        uint16 feeBps = uint16(vm.envOr("FEE_BPS", uint256(500)));

        require(feeRecipient != address(0), "FEE_RECIPIENT not set");
        require(feeBps <= 1000, "FEE_BPS exceeds factory cap");

        console.log("Deployer:    ", vm.addr(pk));
        console.log("FeeRecipient:", feeRecipient);
        console.log("FeeBps:      ", feeBps);
        console.log("ChainId:     ", block.chainid);

        vm.startBroadcast(pk);
        impl = new CompetitionEscrow();
        factory = new CompetitionEscrowFactory(address(impl), feeRecipient, feeBps);
        vm.stopBroadcast();

        console.log("Implementation:", address(impl));
        console.log("Factory:       ", address(factory));

        _writeDeployment(address(impl), address(factory), feeRecipient, feeBps);
    }

    function _writeDeployment(address impl_, address factory_, address feeRecipient, uint16 feeBps)
        internal
    {
        string memory key = "deployment";
        vm.serializeUint(key, "chainId", block.chainid);
        vm.serializeAddress(key, "implementation", impl_);
        vm.serializeAddress(key, "factory", factory_);
        vm.serializeAddress(key, "feeRecipient", feeRecipient);
        string memory json = vm.serializeUint(key, "feeBps", feeBps);

        string memory path =
            string.concat("deployments/", vm.toString(block.chainid), ".json");
        vm.writeJson(json, path);
        console.log("Wrote", path);
    }
}
