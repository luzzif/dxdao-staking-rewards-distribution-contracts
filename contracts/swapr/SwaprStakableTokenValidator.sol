// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "../interfaces/IStakableTokenValidator.sol";
import "../interfaces/IDXTokenRegistry.sol";
import "dxswap-core/contracts/interfaces/IDXswapPair.sol";
import "dxswap-core/contracts/interfaces/IDXswapFactory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SwaprStakableTokenValidator is IStakableTokenValidator, Ownable {
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
            "SwaprStakableTokenValidator: 0-address token registry address"
        );
        require(
            _dxTokenRegistryListId > 0,
            "SwaprStakableTokenValidator: invalid token list id"
        );
        require(
            _dxSwapFactoryAddress != address(0),
            "SwaprStakableTokenValidator: 0-address factory address"
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
            "SwaprStakableTokenValidator: 0-address token registry address"
        );
        dxTokenRegistry = IDXTokenRegistry(_dxTokenRegistryAddress);
    }

    function setDxTokenRegistryListId(uint256 _dxTokenRegistryListId)
        external
        onlyOwner
    {
        require(
            _dxTokenRegistryListId > 0,
            "SwaprStakableTokenValidator: invalid token list id"
        );
        dxTokenRegistryListId = _dxTokenRegistryListId;
    }

    function setDxSwapFactory(address _dxSwapFactoryAddress)
        external
        onlyOwner
    {
        require(
            _dxSwapFactoryAddress != address(0),
            "SwaprStakableTokenValidator: 0-address factory address"
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
            "SwaprStakableTokenValidator: 0-address stakable token"
        );
        IDXswapPair _potentialDxSwapPair = IDXswapPair(_stakableTokenAddress);
        address _token0;
        try _potentialDxSwapPair.token0() returns (address _fetchedToken0) {
            _token0 = _fetchedToken0;
        } catch {
            revert(
                "SwaprStakableTokenValidator: could not get token0 for pair"
            );
        }
        require(
            dxTokenRegistry.isTokenActive(dxTokenRegistryListId, _token0),
            "SwaprStakableTokenValidator: invalid token 0 in Swapr pair"
        );
        address _token1;
        try _potentialDxSwapPair.token1() returns (address _fetchedToken1) {
            _token1 = _fetchedToken1;
        } catch {
            revert(
                "SwaprStakableTokenValidator: could not get token1 for pair"
            );
        }
        require(
            dxTokenRegistry.isTokenActive(dxTokenRegistryListId, _token1),
            "SwaprStakableTokenValidator: invalid token 1 in Swapr pair"
        );
        require(
            dxSwapFactory.getPair(_token0, _token1) == _stakableTokenAddress,
            "SwaprStakableTokenValidator: pair not registered in factory"
        );
    }
}
