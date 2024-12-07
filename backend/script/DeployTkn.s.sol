// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {MyToken} from "../src/MyToken.sol";

contract DeployTkn is Script {
    function run() public {
        vm.startBroadcast();

        MyToken tkn1 = new MyToken("Tkn1", "Tkn1");
        MyToken tkn2 = new MyToken("Tkn2", "Tkn2");
        console.log("Token deployed at:", address(tkn1));
        console.log("Token deployed at:", address(tkn2));

        vm.stopBroadcast();
    }
}
