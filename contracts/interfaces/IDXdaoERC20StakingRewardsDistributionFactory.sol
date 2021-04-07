// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

interface IDXdaoERC20StakingRewardsDistributionFactory {
    function setRewardTokensValidator(address _rewardTokensValidatorAddress)
        external;

    function setStakableTokenValidator(address _stakableTokenValidatorAddress)
        external;

    function createDistribution(
        address[] calldata _rewardTokensAddresses,
        address _stakableTokenAddress,
        uint256[] calldata _rewardAmounts,
        uint64 _startingTimestamp,
        uint64 _endingTimestmp,
        bool _locked,
        uint256 _stakingCap
    ) external;
}
