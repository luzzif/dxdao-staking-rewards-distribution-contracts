// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.6.12;

interface IRewardTokensValidator {
    function validateTokens(address[] calldata _tokens) external view;
}
