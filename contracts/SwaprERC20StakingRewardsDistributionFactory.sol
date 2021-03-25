// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/introspection/ERC165Checker.sol";
import "erc20-staking-rewards-distribution-contracts/ERC20StakingRewardsDistributionFactory.sol";
import "./IRewardTokensValidator.sol";
import "./IStakableTokenValidator.sol";

contract SwaprERC20StakingRewardsDistributionFactory is
    ERC20StakingRewardsDistributionFactory
{
    IRewardTokensValidator public rewardTokensValidator;
    IStakableTokenValidator public stakableTokenValidator;

    constructor(
        address _rewardTokensValidatorAddress,
        address _stakableTokenValidatorAddress
    ) public ERC20StakingRewardsDistributionFactory() {
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
    }

    function setRewardTokensValidator(address _rewardTokensValidatorAddress)
        external
        onlyOwner
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
        bool _locked,
        uint256 _stakingCap
    ) public override {
        rewardTokensValidator.validateTokens(_rewardTokensAddresses);
        stakableTokenValidator.validateToken(_stakableTokenAddress);
        ERC20StakingRewardsDistributionFactory.createDistribution(
            _rewardTokensAddresses,
            _stakableTokenAddress,
            _rewardAmounts,
            _startingTimestamp,
            _endingTimestmp,
            _locked,
            _stakingCap
        );
    }
}
