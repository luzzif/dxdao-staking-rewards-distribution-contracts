// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IRewardTokensValidator.sol";
import "./interfaces/IDXTokenRegistry.sol";

contract DefaultRewardTokensValidator is IRewardTokensValidator, Ownable {
    IDXTokenRegistry public dxTokenRegistry;
    uint256 public dxTokenRegistryListId;

    constructor(address _dxTokenRegistryAddress, uint256 _dxTokenRegistryListId)
    {
        require(
            _dxTokenRegistryAddress != address(0),
            "DefaultRewardTokensValidator: 0-address token registry address"
        );
        require(
            _dxTokenRegistryListId > 0,
            "DefaultRewardTokensValidator: invalid token list id"
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
            "DefaultRewardTokensValidator: 0-address token registry address"
        );
        dxTokenRegistry = IDXTokenRegistry(_dxTokenRegistryAddress);
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

    function validateTokens(address[] calldata _rewardTokens)
        external
        view
        override
    {
        require(
            _rewardTokens.length > 0,
            "DefaultRewardTokensValidator: 0-length reward tokens array"
        );
        for (uint256 _i = 0; _i < _rewardTokens.length; _i++) {
            address _rewardToken = _rewardTokens[_i];
            require(
                _rewardToken != address(0),
                "DefaultRewardTokensValidator: 0-address reward token"
            );
            require(
                dxTokenRegistry.isTokenActive(
                    dxTokenRegistryListId,
                    _rewardToken
                ),
                "DefaultRewardTokensValidator: invalid reward token"
            );
        }
    }
}
