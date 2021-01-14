// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/introspection/ERC165Checker.sol";
import "erc20-staking-rewards-distribution-contracts/ERC20StakingRewardsDistributionFactory.sol";
import "./IRewardTokensValidator.sol";
import "./IStakableTokenValidator.sol";

contract SwaprERC20StakingRewardsDistributionFactory is
    ERC20StakingRewardsDistributionFactory
{
    bool public initialized;
    IRewardTokensValidator public rewardTokensValidator;
    IStakableTokenValidator public stakableTokenValidator;

    function initialize(
        address _rewardTokensValidatorAddress,
        address _stakableTokenValidatorAddress
    ) public onlyOwner onlyUninitialized {
        require(
            _rewardTokensValidatorAddress != address(0),
            "SwaprERC20StakingRewardsDistributionFactory: 0-address reward tokens validator"
        );
        require(
            _stakableTokenValidatorAddress != address(0),
            "SwaprERC20StakingRewardsDistributionFactory: 0-address stakable token validator"
        );
        rewardTokensValidator = IRewardTokensValidator(
            _rewardTokensValidatorAddress
        );
        stakableTokenValidator = IStakableTokenValidator(
            _stakableTokenValidatorAddress
        );
        initialized = true;
    }

    function setRewardTokensValidator(address _rewardTokensValidatorAddress)
        external
        onlyOwner
        onlyInitialized
    {
        require(
            _rewardTokensValidatorAddress != address(0),
            "SwaprERC20StakingRewardsDistributionFactory: 0-address reward tokens validator"
        );
        rewardTokensValidator = IRewardTokensValidator(
            _rewardTokensValidatorAddress
        );
    }

    function setStakableTokenValidator(address _stakableTokenValidatorAddress)
        external
        onlyOwner
        onlyInitialized
    {
        require(
            _stakableTokenValidatorAddress != address(0),
            "SwaprERC20StakingRewardsDistributionFactory: 0-address stakable token validator"
        );
        stakableTokenValidator = IStakableTokenValidator(
            _stakableTokenValidatorAddress
        );
    }

    function createDistribution(
        address[] calldata _rewardTokensAddresses,
        address _stakableTokenAddress,
        uint256[] calldata _rewardAmounts,
        uint64 _startingTimestamp,
        uint64 _endingTimestmp,
        bool _locked
    ) public override onlyInitialized {
        rewardTokensValidator.validateTokens(_rewardTokensAddresses);
        stakableTokenValidator.validateToken(_stakableTokenAddress);
        ERC20StakingRewardsDistributionFactory.createDistribution(
            _rewardTokensAddresses,
            _stakableTokenAddress,
            _rewardAmounts,
            _startingTimestamp,
            _endingTimestmp,
            _locked
        );
    }

    modifier onlyUninitialized() {
        require(
            !initialized,
            "SwaprERC20StakingRewardsDistributionFactory: already initialized"
        );
        _;
    }

    modifier onlyInitialized() {
        require(
            initialized,
            "SwaprERC20StakingRewardsDistributionFactory: not initialized"
        );
        _;
    }
}
