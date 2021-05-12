// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

import "erc20-staking-rewards-distribution-contracts/interfaces/IERC20StakingRewardsDistributionFactory.sol";

interface IDXdaoERC20StakingRewardsDistributionFactory is
    IERC20StakingRewardsDistributionFactory
{
    function setRewardTokensValidator(address _rewardTokensValidatorAddress)
        external;

    function setStakableTokenValidator(address _stakableTokenValidatorAddress)
        external;
}
