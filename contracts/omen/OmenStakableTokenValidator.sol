// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "../interfaces/IStakableTokenValidator.sol";
import "../interfaces/IDXTokenRegistry.sol";
import "dxswap-core/contracts/interfaces/IDXswapPair.sol";
import "dxswap-core/contracts/interfaces/IDXswapFactory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OmenStakableTokenValidator is IStakableTokenValidator, Ownable {
    IDXTokenRegistry public dxTokenRegistry;
    uint256 public dxTokenRegistryListId;

    constructor(address _dxTokenRegistryAddress, uint256 _dxTokenRegistryListId)
    {
        require(
            _dxTokenRegistryAddress != address(0),
            "OmenStakableTokenValidator: 0-address token registry address"
        );
        require(
            _dxTokenRegistryListId > 0,
            "OmenStakableTokenValidator: invalid token list id"
        );
        dxTokenRegistry = IDXTokenRegistry(_dxTokenRegistryAddress);
        dxTokenRegistryListId = _dxTokenRegistryListId;
    }

    function setDxTokenRegistry(address _dxTokenRegistryAddress)
        external
        onlyOwner
    {
        require(
            _dxTokenRegistryAddress != address(0),
            "OmenStakableTokenValidator: 0-address token registry address"
        );
        dxTokenRegistry = IDXTokenRegistry(_dxTokenRegistryAddress);
    }

    function setDxTokenRegistryListId(uint256 _dxTokenRegistryListId)
        external
        onlyOwner
    {
        require(
            _dxTokenRegistryListId > 0,
            "OmenStakableTokenValidator: invalid token list id"
        );
        dxTokenRegistryListId = _dxTokenRegistryListId;
    }

    function validateToken(address _stakableTokenAddress)
        external
        view
        override
    {
        require(
            _stakableTokenAddress != address(0),
            "OmenStakableTokenValidator: 0-address stakable token"
        );
        require(
            dxTokenRegistry.isTokenActive(
                dxTokenRegistryListId,
                _stakableTokenAddress
            ),
            "OmenStakableTokenValidator: invalid stakable token"
        );
    }
}
