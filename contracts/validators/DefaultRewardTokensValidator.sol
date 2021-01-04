// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.12;

import "../abstraction/IRewardTokensValidator.sol";
import "dxdao-token-registry/contracts/dxTokenRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DefaultRewardTokensValidator is IRewardTokensValidator, Ownable {
    DXTokenRegistry dxTokenRegistry;
    uint256 dxTokenRegistryListId;

    constructor(address _dxTokenRegistryAddress, uint256 _dxTokenRegistryListId)
        public
    {
        require(
            _dxTokenRegistryAddress != address(0),
            "DefaultRewardTokensValidator: 0-address token registry address"
        );
        require(
            _dxTokenRegistryListId > 0,
            "DefaultRewardTokensValidator: invalid token list id"
        );
        dxTokenRegistry = DXTokenRegistry(_dxTokenRegistryAddress);
        dxTokenRegistryListId = _dxTokenRegistryListId;
    }

    function setDxTokenRegistry(address _dxTokenRegistryAddress)
        external
        onlyOwner
    {
        require(
            _dxTokenRegistryAddress != address(0),
            "DefaultRewardTokensValidator: 0-address token registry address"
        );
        dxTokenRegistry = DXTokenRegistry(_dxTokenRegistryAddress);
    }

    function setDxTokenRegistryListId(uint256 _dxTokenRegistryListId)
        external
        onlyOwner
    {
        require(
            _dxTokenRegistryListId > 0,
            "DefaultRewardTokensValidator: invalid token list id"
        );
        dxTokenRegistryListId = _dxTokenRegistryListId;
    }

    function areRewardTokensValid(address[] calldata _rewardTokens)
        external
        override
        returns (bool)
    {
        if (_rewardTokens.length == 0) {
            return false;
        }
        for (uint256 _i = 0; _i < _rewardTokens.length; _i++) {
            address _rewardToken = _rewardTokens[_i];
            if (
                _rewardToken == address(0) ||
                !dxTokenRegistry.isTokenActive(
                    dxTokenRegistryListId,
                    _rewardToken
                )
            ) {
                return false;
            }
        }
        return true;
    }
}
