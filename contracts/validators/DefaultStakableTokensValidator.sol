// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.12;

import "../abstraction/IStakableTokensValidator.sol";
import "dxswap-core/contracts/interfaces/IDXswapPair.sol";
import "dxdao-token-registry/contracts/dxTokenRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DefaultStakableTokensValidator is IStakableTokensValidator, Ownable {
    DXTokenRegistry public dxTokenRegistry;
    uint256 public dxTokenRegistryListId;
    address public dxSwapFactoryAddress;

    constructor(
        address _dxTokenRegistryAddress,
        uint256 _dxTokenRegistryListId,
        address _dxSwapFactoryAddress
    ) public {
        require(
            _dxTokenRegistryAddress != address(0),
            "DefaultStakableTokensValidator: 0-address token registry address"
        );
        require(
            _dxTokenRegistryListId > 0,
            "DefaultStakableTokensValidator: invalid token list id"
        );
        require(
            _dxSwapFactoryAddress != address(0),
            "DefaultStakableTokensValidator: 0-address factory address"
        );
        dxTokenRegistry = DXTokenRegistry(_dxTokenRegistryAddress);
        dxTokenRegistryListId = _dxTokenRegistryListId;
        dxSwapFactoryAddress = _dxSwapFactoryAddress;
    }

    function setDxTokenRegistry(address _dxTokenRegistryAddress)
        external
        onlyOwner
    {
        require(
            _dxTokenRegistryAddress != address(0),
            "DefaultStakableTokensValidator: 0-address token registry address"
        );
        dxTokenRegistry = DXTokenRegistry(_dxTokenRegistryAddress);
    }

    function setDxTokenRegistryListId(uint256 _dxTokenRegistryListId)
        external
        onlyOwner
    {
        require(
            _dxTokenRegistryListId > 0,
            "DefaultStakableTokensValidator: invalid token list id"
        );
        dxTokenRegistryListId = _dxTokenRegistryListId;
    }

    function setDxSwapFactoryAddress(address _dxSwapFactoryAddress)
        external
        onlyOwner
    {
        require(
            _dxSwapFactoryAddress != address(0),
            "DefaultStakableTokensValidator: 0-address factory address"
        );
        dxSwapFactoryAddress = _dxSwapFactoryAddress;
    }

    function areStakableTokensValid(address[] calldata _stakableTokens)
        external
        view
        override
        returns (bool)
    {
        if (_stakableTokens.length == 0) {
            return false;
        }
        for (uint256 _i = 0; _i < _stakableTokens.length; _i++) {
            address _stakableTokenAddress = _stakableTokens[_i];
            if (_stakableTokenAddress == address(0)) {
                return false;
            }
            IDXswapPair _dxSwapPair = IDXswapPair(_stakableTokenAddress);
            address _token0;
            address _token1;
            try _dxSwapPair.factory() returns (address _fetchedFactoryAddress) {
                if (_fetchedFactoryAddress != dxSwapFactoryAddress) {
                    return false;
                }
            } catch {
                return false;
            }
            try _dxSwapPair.token0() returns (address _fetchedToken0) {
                _token0 = _fetchedToken0;
            } catch {
                return false;
            }
            try _dxSwapPair.token1() returns (address _fetchedToken1) {
                _token1 = _fetchedToken1;
            } catch {
                return false;
            }
            if (
                !dxTokenRegistry.isTokenActive(
                    dxTokenRegistryListId,
                    _token0
                ) ||
                !dxTokenRegistry.isTokenActive(dxTokenRegistryListId, _token1)
            ) {
                return false;
            }
        }
        return true;
    }
}
