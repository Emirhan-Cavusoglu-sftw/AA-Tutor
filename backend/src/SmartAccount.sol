// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IAccount} from "account-abstraction/interfaces/IAccount.sol";
import {PackedUserOperation} from "account-abstraction/interfaces/PackedUserOperation.sol";
import {UniswapV2Factory} from "uniswapv2-solc0.8/UniswapV2Factory.sol";
import {UniswapV2Router} from "uniswapv2-solc0.8/UniswapV2Router.sol";
import {MyToken} from "../src/MyToken.sol";

contract SmartAccount is IAccount {
    uint256 public counter;
    UniswapV2Router public univ2Router =
        UniswapV2Router(payable(0x2DbCDb8162516bb4b2b462f8B919c619c99dF7Df));

    MyToken public tkn1 = MyToken(0x97dBc1b214d66eC151850961Fe48ADBE9987f583);
    MyToken public tkn2 = MyToken(0x2adCAf88784BAC00247b39278892924eC68ba50f);

    function validateUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external returns (uint256 validationData) {
        return 0;
    }

    function increase() public {
        counter++;
    }

    function swap(
        uint256 amountIn,
        uint256 amountOutMin,
        address to,
        address token1,
        address token2,
        uint256 deadline
    ) public {
        tkn1 = MyToken(token1);
        tkn1.approve(address(univ2Router), amountIn);
        address[] memory path = new address[](2);
        path[0] = token1;
        path[1] = token2;
        univ2Router.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            to,
            deadline
        );
    }

    function mint() public {
        tkn1.mint(address(this), 10 ether);
        tkn2.mint(address(this), 10 ether);
    }
}
