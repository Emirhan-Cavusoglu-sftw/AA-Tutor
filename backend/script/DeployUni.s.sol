// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
// import {SmartAccount} from "../src/SmartAccount.sol";
// import {AccountFactory} from "../src/AccountFactory.sol";
import {UniswapV2Factory} from "uniswapv2-solc0.8/UniswapV2Factory.sol";
import {UniswapV2Router} from "uniswapv2-solc0.8/UniswapV2Router.sol";

contract DeployUni is Script {
    function run() public {
        vm.startBroadcast();

        UniswapV2Factory univ2 = new UniswapV2Factory(
            0x8989992cb470d2EBDd8247cE9eF22Cc518B6d37E
        );
        // UniswapV2Router univ2Router = new UniswapV2Router(0xAf3dD4C0bC43936fAEd74fE8a790aDC3a83af689, 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14);
        console.log("v2 Factory deployed at:", address(univ2));
        // console.log(":", address(univ2Router));
        console.log();

        vm.stopBroadcast();
    }
}
