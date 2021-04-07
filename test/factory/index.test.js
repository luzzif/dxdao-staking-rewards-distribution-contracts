require("../utils/assertion");
const BN = require("bn.js");
const { expect } = require("chai");
const { createSwaprPair, getOrderedTokensInPair } = require("../utils");

const DXdaoERC20StakingRewardsDistributionFactory = artifacts.require(
    "DXdaoERC20StakingRewardsDistributionFactory"
);
const ERC20StakingRewardsDistribution = artifacts.require(
    "ERC20StakingRewardsDistribution"
);
const FirstRewardERC20 = artifacts.require("FirstRewardERC20");
const FirstStakableERC20 = artifacts.require("FirstStakableERC20");
const SecondStakableERC20 = artifacts.require("SecondStakableERC20");
const DXTokenRegistry = artifacts.require("DXTokenRegistry");
const DXswapFactory = artifacts.require("DXswapFactory");
const DXswapPair = artifacts.require("DXswapPair");
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
        dxSwapFactoryInstance,
        rewardTokenInstance,
        firstStakableTokenInstance,
        secondStakableTokenInstance,
        defaultRewardTokensValidatorInstance,
        defaultStakableTokensValidatorInstance,
        ownerAddress;

    beforeEach(async () => {
        const accounts = await web3.eth.getAccounts();
        ownerAddress = accounts[1];
        dxSwapFactoryInstance = await DXswapFactory.new(
            "0x0000000000000000000000000000000000000000" // we don't care about fee to setter
        );
        rewardTokenInstance = await FirstRewardERC20.new();
        firstStakableTokenInstance = await FirstStakableERC20.new();
        secondStakableTokenInstance = await SecondStakableERC20.new();
        dxTokenRegistryInstance = await DXTokenRegistry.new();
        defaultRewardTokensValidatorInstance = await DefaultRewardTokensValidator.new(
            dxTokenRegistryInstance.address,
            1,
            { from: ownerAddress }
        );
        defaultStakableTokensValidatorInstance = await DefaultStakableTokenValidator.new(
            dxTokenRegistryInstance.address,
            1,
            dxSwapFactoryInstance.address,
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

    it("should fail when trying to create a distribution with a Swapr LP token related to a pair with an unlisted token0", async () => {
        try {
            const { token0Address, token1Address } = getOrderedTokensInPair(
                firstStakableTokenInstance.address,
                secondStakableTokenInstance.address
            );
            await dxTokenRegistryInstance.addList("test");
            await dxTokenRegistryInstance.addTokens(1, [
                rewardTokenInstance.address,
                token1Address,
            ]);
            await defaultRewardTokensValidatorInstance.setDxTokenRegistryListId(
                1,
                { from: ownerAddress }
            );
            const lpTokenAddress = await createSwaprPair(
                dxSwapFactoryInstance,
                token0Address,
                token1Address
            );
            // setting valid list on stakable tokens validator
            await defaultStakableTokensValidatorInstance.setDxTokenRegistryListId(
                1,
                { from: ownerAddress }
            );
            await dxDaoERC20DistributionFactoryInstance.createDistribution(
                [rewardTokenInstance.address],
                lpTokenAddress,
                ["1"],
                Math.floor(Date.now() / 1000) + 1000,
                Math.floor(Date.now() / 1000) + 2000,
                false,
                0
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokenValidator: invalid token 0 in Swapr pair"
            );
        }
    });

    it("should fail when trying to create a distribution with a Swapr LP token related to a pair with an unlisted token1", async () => {
        try {
            const { token0Address, token1Address } = getOrderedTokensInPair(
                firstStakableTokenInstance.address,
                secondStakableTokenInstance.address
            );
            await dxTokenRegistryInstance.addList("test");
            await dxTokenRegistryInstance.addTokens(1, [
                rewardTokenInstance.address,
                token0Address,
            ]);
            await defaultRewardTokensValidatorInstance.setDxTokenRegistryListId(
                1,
                { from: ownerAddress }
            );
            const lpTokenAddress = await createSwaprPair(
                dxSwapFactoryInstance,
                token0Address,
                token1Address
            );
            // setting valid list on stakable tokens validator
            await defaultStakableTokensValidatorInstance.setDxTokenRegistryListId(
                1,
                { from: ownerAddress }
            );
            await dxDaoERC20DistributionFactoryInstance.createDistribution(
                [rewardTokenInstance.address],
                lpTokenAddress,
                ["1"],
                Math.floor(Date.now() / 1000) + 1000,
                Math.floor(Date.now() / 1000) + 2000,
                false,
                0
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokenValidator: invalid token 1 in Swapr pair"
            );
        }
    });

    it("should succeed when trying to create a distribution with a stakable token that represents a swapr pair with both tokens listed", async () => {
        // listing reward token so that validation passes
        await dxTokenRegistryInstance.addList("test");
        await dxTokenRegistryInstance.addTokens(1, [
            rewardTokenInstance.address,
        ]);
        // listing both one stakable tokens
        await dxTokenRegistryInstance.addTokens(1, [
            firstStakableTokenInstance.address,
        ]);
        await dxTokenRegistryInstance.addTokens(1, [
            secondStakableTokenInstance.address,
        ]);
        // setting validation token list to correct id for validators. This has
        // already been done in the before each hook, but redoing it here for
        // clarity
        await defaultRewardTokensValidatorInstance.setDxTokenRegistryListId(1, {
            from: ownerAddress,
        });
        await defaultStakableTokensValidatorInstance.setDxTokenRegistryListId(
            1,
            { from: ownerAddress }
        );
        const { token0Address, token1Address } = getOrderedTokensInPair(
            firstStakableTokenInstance.address,
            secondStakableTokenInstance.address
        );
        // creating pair on swapr. Both tokens are listed
        const createdPairAddress = await createSwaprPair(
            dxSwapFactoryInstance,
            token0Address,
            token1Address
        );
        const createdPairInstance = await DXswapPair.at(createdPairAddress);
        expect(await createdPairInstance.token0()).to.be.equal(token0Address);
        expect(await createdPairInstance.token1()).to.be.equal(token1Address);
        expect(await createdPairInstance.factory()).to.be.equal(
            dxSwapFactoryInstance.address
        );
        // minting approving reward tokens to avoid balance and allowance-related fails
        const rewardAmount = new BN(web3.utils.toWei("1"));
        await rewardTokenInstance.mint(ownerAddress, rewardAmount);
        await rewardTokenInstance.approve(
            dxDaoERC20DistributionFactoryInstance.address,
            rewardAmount,
            { from: ownerAddress }
        );
        const startingTimestamp = new BN(Math.floor(Date.now() / 1000) + 1000);
        const endingTimestamp = new BN(Math.floor(Date.now() / 1000) + 2000);
        const duration = endingTimestamp.sub(startingTimestamp);
        await dxDaoERC20DistributionFactoryInstance.createDistribution(
            [rewardTokenInstance.address],
            createdPairAddress,
            [rewardAmount],
            startingTimestamp,
            endingTimestamp,
            false,
            0,
            { from: ownerAddress }
        );
        expect(
            await dxDaoERC20DistributionFactoryInstance.getDistributionsAmount()
        ).to.be.equalBn(new BN(1));
        const erc20DistributionInstance = await ERC20StakingRewardsDistribution.at(
            await dxDaoERC20DistributionFactoryInstance.distributions(0)
        );
        expect(await erc20DistributionInstance.initialized()).to.be.true;

        // reward token related checks
        const onchainRewardTokens = await erc20DistributionInstance.getRewardTokens();
        expect(onchainRewardTokens).to.have.length(1);
        expect(onchainRewardTokens[0]).to.be.equal(rewardTokenInstance.address);
        expect(
            await rewardTokenInstance.balanceOf(
                erc20DistributionInstance.address
            )
        ).to.be.equalBn(rewardAmount);
        expect(
            await erc20DistributionInstance.rewardAmount(
                rewardTokenInstance.address
            )
        ).to.be.equalBn(rewardAmount);

        // stakable token related checks
        expect(await erc20DistributionInstance.stakableToken()).to.be.equal(
            createdPairAddress
        );

        const onchainStartingTimestamp = await erc20DistributionInstance.startingTimestamp();
        expect(onchainStartingTimestamp).to.be.equalBn(startingTimestamp);
        const onchainEndingTimestamp = await erc20DistributionInstance.endingTimestamp();
        expect(
            onchainEndingTimestamp.sub(onchainStartingTimestamp)
        ).to.be.equalBn(duration);
    });
});
