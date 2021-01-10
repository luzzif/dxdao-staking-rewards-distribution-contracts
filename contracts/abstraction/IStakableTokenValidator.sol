// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.6.12;

interface IStakableTokenValidator {
    function validateToken(address _token) external view;
}
