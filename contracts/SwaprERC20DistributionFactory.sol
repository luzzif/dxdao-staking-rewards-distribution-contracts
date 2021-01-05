// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/introspection/ERC165Checker.sol";
import "erc20-staking-rewards-contracts/contracts/ERC20DistributionFactory.sol";
import "./abstraction/IRewardTokensValidator.sol";
import "./abstraction/IStakableTokensValidator.sol";

contract SwaprERC20DistributionFactory is ERC20DistributionFactory {
    IRewardTokensValidator public rewardTokensValidator;
    IStakableTokensValidator public stakableTokensValidator;

    constructor(
        address _rewardTokensValidatorAddress,
        address _stakableTokensValidatorAddress
    ) public ERC20DistributionFactory() {
        require(
            _rewardTokensValidatorAddress != address(0),
            "SwaprERC20DistributionFactory: 0-address reward tokens validator"
        );
        require(
            _stakableTokensValidatorAddress != address(0),
            "SwaprERC20DistributionFactory: 0-address stakable tokens validator"
        );
        rewardTokensValidator = IRewardTokensValidator(
            _rewardTokensValidatorAddress
        );
        stakableTokensValidator = IStakableTokensValidator(
            _stakableTokensValidatorAddress
        );
    }

    function setRewardTokensValidator(address _rewardTokensValidatorAddress)
        external
        onlyOwner
    {
        require(
            _rewardTokensValidatorAddress != address(0),
            "SwaprERC20DistributionFactory: 0-address reward tokens validator"
        );
        rewardTokensValidator = IRewardTokensValidator(
            _rewardTokensValidatorAddress
        );
    }

    function setStakableTokensValidator(address _stakableTokensValidatorAddress)
        external
        onlyOwner
    {
        require(
            _stakableTokensValidatorAddress != address(0),
            "SwaprERC20DistributionFactory: 0-address stakable tokens validator"
        );
        stakableTokensValidator = IStakableTokensValidator(
            _stakableTokensValidatorAddress
        );
    }

    function createDistribution(
        address[] calldata _rewardTokensAddresses,
        address[] calldata _stakableTokensAddresses,
        uint256[] calldata _rewardAmounts,
        uint64 _startingTimestamp,
        uint64 _endingTimestmp,
        bool _locked
    ) public override {
        require(
            rewardTokensValidator.areRewardTokensValid(_rewardTokensAddresses),
            "SwaprERC20DistributionFactory: invalid reward tokens"
        );
        require(
            stakableTokensValidator.areStakableTokensValid(
                _stakableTokensAddresses
            ),
            "SwaprERC20DistributionFactory: invalid stakable tokens"
        );
        ERC20DistributionFactory.createDistribution(
            _rewardTokensAddresses,
            _stakableTokensAddresses,
            _rewardAmounts,
            _startingTimestamp,
            _endingTimestmp,
            _locked
        );
    }
}
