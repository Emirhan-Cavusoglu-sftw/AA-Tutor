// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IAccount} from "account-abstraction/interfaces/IAccount.sol";
import {PackedUserOperation} from "account-abstraction/interfaces/PackedUserOperation.sol";
import {SmartAccount} from "./SmartAccount.sol";

contract AccountFactory {
    mapping(address => address) public ownerToAccount;

    function createAccount() public {
        SmartAccount account = new SmartAccount();
        ownerToAccount[msg.sender] = address(account);
    }

}
