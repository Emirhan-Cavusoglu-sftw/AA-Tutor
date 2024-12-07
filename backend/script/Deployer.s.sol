// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SmartAccount} from "../src/SmartAccount.sol";
import {AccountFactory} from "../src/AccountFactory.sol";

contract Deployer is Script {
    function run() public {
        vm.startBroadcast();

        SmartAccount account = new SmartAccount();
        console.log("SmartAccount deployed at:", address(account));
        console.log();

        vm.stopBroadcast();
    }
}
