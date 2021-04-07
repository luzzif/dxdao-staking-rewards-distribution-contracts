// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./interfaces/IStakableTokenValidator.sol";
import "./interfaces/IDXTokenRegistry.sol";
import "dxswap-core/contracts/interfaces/IDXswapPair.sol";
import "dxswap-core/contracts/interfaces/IDXswapFactory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DefaultStakableTokenValidator is IStakableTokenValidator, Ownable {
    IDXTokenRegistry public dxTokenRegistry;
    uint256 public dxTokenRegistryListId;
    IDXswapFactory public dxSwapFactory;

    constructor(
        address _dxTokenRegistryAddress,
        uint256 _dxTokenRegistryListId,
        address _dxSwapFactoryAddress
    ) {
        require(
            _dxTokenRegistryAddress != address(0),
            "DefaultStakableTokenValidator: 0-address token registry address"
        );
        require(
            _dxTokenRegistryListId > 0,
            "DefaultStakableTokenValidator: invalid token list id"
        );
        require(
            _dxSwapFactoryAddress != address(0),
            "DefaultStakableTokenValidator: 0-address factory address"
        );
        dxTokenRegistry = IDXTokenRegistry(_dxTokenRegistryAddress);
        dxTokenRegistryListId = _dxTokenRegistryListId;
        dxSwapFactory = IDXswapFactory(_dxSwapFactoryAddress);
    }

    function setDxTokenRegistry(address _dxTokenRegistryAddress)
        external
        onlyOwner
    {
        require(
            _dxTokenRegistryAddress != address(0),
            "DefaultStakableTokenValidator: 0-address token registry address"
        );
        dxTokenRegistry = IDXTokenRegistry(_dxTokenRegistryAddress);
    }

    function setDxTokenRegistryListId(uint256 _dxTokenRegistryListId)
        external
        onlyOwner
    {
        require(
            _dxTokenRegistryListId > 0,
            "DefaultStakableTokenValidator: invalid token list id"
        );
        dxTokenRegistryListId = _dxTokenRegistryListId;
    }

    function setDxSwapFactory(address _dxSwapFactoryAddress)
        external
        onlyOwner
    {
        require(
            _dxSwapFactoryAddress != address(0),
            "DefaultStakableTokenValidator: 0-address factory address"
        );
        dxSwapFactory = IDXswapFactory(_dxSwapFactoryAddress);
    }

    function validateToken(address _stakableTokenAddress)
        external
        view
        override
    {
        require(
            _stakableTokenAddress != address(0),
            "DefaultStakableTokenValidator: 0-address stakable token"
        );
        require(
            dxTokenRegistry.isTokenActive(
                dxTokenRegistryListId,
                _stakableTokenAddress
            ),
            "DefaultStakableTokenValidator: invalid stakable token"
        );
    }
}
