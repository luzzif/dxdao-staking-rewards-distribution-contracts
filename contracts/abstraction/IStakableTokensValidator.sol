// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.6.12;

interface IStakableTokensValidator {
    function areStakableTokensValid(address[] calldata _stakableTokens)
        external
        view
        returns (bool);
}
