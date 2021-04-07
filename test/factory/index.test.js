require("../utils/assertion");
const { expect } = require("chai");

const DXdaoERC20StakingRewardsDistributionFactory = artifacts.require(
    "DXdaoERC20StakingRewardsDistributionFactory"
);
const ERC20StakingRewardsDistribution = artifacts.require(
    "ERC20StakingRewardsDistribution"
);
const FirstRewardERC20 = artifacts.require("FirstRewardERC20");
const DXTokenRegistry = artifacts.require("DXTokenRegistry");
const DefaultRewardTokensValidator = artifacts.require(
    "DefaultRewardTokensValidator"
);
const DefaultStakableTokenValidator = artifacts.require(
    "DefaultStakableTokenValidator"
);

contract("DXdaoERC20StakingRewardsDistributionFactory", () => {
    let dxDaoERC20DistributionFactoryInstance,
        erc20DistributionImplementationInstance,
        dxTokenRegistryInstance,
        rewardTokenInstance,
        defaultRewardTokensValidatorInstance,
        defaultStakableTokensValidatorInstance,
        ownerAddress;

    beforeEach(async () => {
        const accounts = await web3.eth.getAccounts();
        ownerAddress = accounts[1];
        rewardTokenInstance = await FirstRewardERC20.new();
        dxTokenRegistryInstance = await DXTokenRegistry.new();
        defaultRewardTokensValidatorInstance = await DefaultRewardTokensValidator.new(
            dxTokenRegistryInstance.address,
            1,
            { from: ownerAddress }
        );
        defaultStakableTokensValidatorInstance = await DefaultStakableTokenValidator.new(
            dxTokenRegistryInstance.address,
            1,
            { from: ownerAddress }
        );
        erc20DistributionImplementationInstance = await ERC20StakingRewardsDistribution.new();
        dxDaoERC20DistributionFactoryInstance = await DXdaoERC20StakingRewardsDistributionFactory.new(
            defaultRewardTokensValidatorInstance.address,
            defaultStakableTokensValidatorInstance.address,
            erc20DistributionImplementationInstance.address,
            { from: ownerAddress }
        );
    });

    it("should have the expected owner", async () => {
        expect(await dxDaoERC20DistributionFactoryInstance.owner()).to.be.equal(
            ownerAddress
        );
    });

    it("should fail when a non-owner tries to set a new reward tokens validator address", async () => {
        try {
            await dxDaoERC20DistributionFactoryInstance.setRewardTokensValidator(
                defaultRewardTokensValidatorInstance.address
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "Ownable: caller is not the owner"
            );
        }
    });

    it("should succeed when an owner sets a valid reward tokens validator address", async () => {
        expect(
            await dxDaoERC20DistributionFactoryInstance.rewardTokensValidator()
        ).to.be.equal(defaultRewardTokensValidatorInstance.address);
        const newAddress = "0x0000000000000000000000000000000000000aBc";
        await dxDaoERC20DistributionFactoryInstance.setRewardTokensValidator(
            newAddress,
            { from: ownerAddress }
        );
        expect(
            await dxDaoERC20DistributionFactoryInstance.rewardTokensValidator()
        ).to.be.equal(newAddress);
    });

    it("should fail when a non-owner tries to set a new stakable tokens validator address", async () => {
        try {
            await dxDaoERC20DistributionFactoryInstance.setStakableTokenValidator(
                defaultRewardTokensValidatorInstance.address
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "Ownable: caller is not the owner"
            );
        }
    });

    it("should succeed when setting a valid stakable tokens validator address", async () => {
        expect(
            await dxDaoERC20DistributionFactoryInstance.stakableTokenValidator()
        ).to.be.equal(defaultStakableTokensValidatorInstance.address);
        const newAddress = "0x0000000000000000000000000000000000000aBc";
        await dxDaoERC20DistributionFactoryInstance.setStakableTokenValidator(
            newAddress,
            { from: ownerAddress }
        );
        expect(
            await dxDaoERC20DistributionFactoryInstance.stakableTokenValidator()
        ).to.be.equal(newAddress);
    });

    it("should fail when trying to create a distribution with 0-address reward token", async () => {
        try {
            await dxDaoERC20DistributionFactoryInstance.createDistribution(
                ["0x0000000000000000000000000000000000000000"],
                "0x0000000000000000000000000000000000000000",
                ["1"],
                Math.floor(Date.now() / 1000) + 1000,
                Math.floor(Date.now() / 1000) + 2000,
                false,
                0
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultRewardTokensValidator: 0-address reward token"
            );
        }
    });

    it("should fail when trying to create a distribution with an unlisted reward token", async () => {
        try {
            // setting valid list on reward tokens validator
            await dxTokenRegistryInstance.addList("test");
            await defaultRewardTokensValidatorInstance.setDxTokenRegistryListId(
                1,
                { from: ownerAddress }
            );
            await dxDaoERC20DistributionFactoryInstance.createDistribution(
                [rewardTokenInstance.address],
                "0x0000000000000000000000000000000000000000",
                ["1"],
                Math.floor(Date.now() / 1000) + 1000,
                Math.floor(Date.now() / 1000) + 2000,
                false,
                0
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultRewardTokensValidator: invalid reward token"
            );
        }
    });

    it("should fail when trying to create a distribution with 0-address stakable token", async () => {
        try {
            // listing reward token so that validation passes
            await dxTokenRegistryInstance.addList("test");
            await dxTokenRegistryInstance.addTokens(1, [
                rewardTokenInstance.address,
            ]);
            await dxDaoERC20DistributionFactoryInstance.createDistribution(
                [rewardTokenInstance.address],
                "0x0000000000000000000000000000000000000000",
                ["1"],
                Math.floor(Date.now() / 1000) + 1000,
                Math.floor(Date.now() / 1000) + 2000,
                false,
                0
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokenValidator: 0-address stakable token"
            );
        }
    });
});
