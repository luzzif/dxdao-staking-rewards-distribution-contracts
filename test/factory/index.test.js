require("../utils/assertion");
const BN = require("bn.js");
const { expect } = require("chai");

const SwaprERC20DistributionFactory = artifacts.require(
    "SwaprERC20DistributionFactory"
);
const ERC20Distribution = artifacts.require("ERC20Distribution");
const FirstRewardERC20 = artifacts.require("FirstRewardERC20");
const FirstStakableERC20 = artifacts.require("FirstStakableERC20");
const SecondStakableERC20 = artifacts.require("SecondStakableERC20");
const DXTokenRegistry = artifacts.require("DXTokenRegistry");
const DXswapFactory = artifacts.require("DXswapFactory");
const DXswapPair = artifacts.require("DXswapPair");
const DefaultRewardTokensValidator = artifacts.require(
    "DefaultRewardTokensValidator"
);
const DefaultStakableTokensValidator = artifacts.require(
    "DefaultStakableTokensValidator"
);

contract("SwaprERC20DistributionFactory", () => {
    let swaprERC20DistributionFactoryInstance,
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
        defaultStakableTokensValidatorInstance = await DefaultStakableTokensValidator.new(
            dxTokenRegistryInstance.address,
            1,
            dxSwapFactoryInstance.address,
            { from: ownerAddress }
        );
        swaprERC20DistributionFactoryInstance = await SwaprERC20DistributionFactory.new(
            defaultRewardTokensValidatorInstance.address,
            defaultStakableTokensValidatorInstance.address,
            { from: ownerAddress }
        );
    });

    it("should fail when trying to deploy a factory with a 0-address reward tokens validator", async () => {
        try {
            await SwaprERC20DistributionFactory.new(
                "0x0000000000000000000000000000000000000000",
                defaultStakableTokensValidatorInstance.address,
                { from: ownerAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprERC20DistributionFactory: 0-address reward tokens validator"
            );
        }
    });

    it("should fail when trying to deploy a factory with a 0-address stakable tokens validator", async () => {
        try {
            await SwaprERC20DistributionFactory.new(
                defaultRewardTokensValidatorInstance.address,
                "0x0000000000000000000000000000000000000000",
                { from: ownerAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprERC20DistributionFactory: 0-address stakable tokens validator"
            );
        }
    });

    it("should have the expected owner", async () => {
        expect(await swaprERC20DistributionFactoryInstance.owner()).to.be.equal(
            ownerAddress
        );
    });

    it("should fail when a non-owner tries to set a new reward tokens validator address", async () => {
        try {
            await swaprERC20DistributionFactoryInstance.setRewardTokensValidator(
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
            await swaprERC20DistributionFactoryInstance.rewardTokensValidator()
        ).to.be.equal(defaultRewardTokensValidatorInstance.address);
        const newAddress = "0x0000000000000000000000000000000000000aBc";
        await swaprERC20DistributionFactoryInstance.setRewardTokensValidator(
            newAddress,
            { from: ownerAddress }
        );
        expect(
            await swaprERC20DistributionFactoryInstance.rewardTokensValidator()
        ).to.be.equal(newAddress);
    });

    it("should fail when a non-owner tries to set a new stakable tokens validator address", async () => {
        try {
            await swaprERC20DistributionFactoryInstance.setStakableTokensValidator(
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
            await swaprERC20DistributionFactoryInstance.stakableTokensValidator()
        ).to.be.equal(defaultStakableTokensValidatorInstance.address);
        const newAddress = "0x0000000000000000000000000000000000000aBc";
        await swaprERC20DistributionFactoryInstance.setStakableTokensValidator(
            newAddress,
            { from: ownerAddress }
        );
        expect(
            await swaprERC20DistributionFactoryInstance.stakableTokensValidator()
        ).to.be.equal(newAddress);
    });

    it("should fail when setting a zero address as the supported reward tokens validator", async () => {
        try {
            await swaprERC20DistributionFactoryInstance.setRewardTokensValidator(
                "0x0000000000000000000000000000000000000000",
                { from: ownerAddress }
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprERC20DistributionFactory: 0-address reward tokens validator"
            );
        }
    });

    it("should fail when setting a zero address as the supported stakable tokens validator", async () => {
        try {
            await swaprERC20DistributionFactoryInstance.setStakableTokensValidator(
                "0x0000000000000000000000000000000000000000",
                { from: ownerAddress }
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprERC20DistributionFactory: 0-address stakable tokens validator"
            );
        }
    });

    it("should fail when trying to create a distribution with 0-address reward token", async () => {
        try {
            await swaprERC20DistributionFactoryInstance.createDistribution(
                ["0x0000000000000000000000000000000000000000"],
                ["0x0000000000000000000000000000000000000000"],
                ["1"],
                Math.floor(Date.now() / 1000) + 1000,
                Math.floor(Date.now() / 1000) + 2000,
                false
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprERC20DistributionFactory: invalid reward tokens"
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
            await swaprERC20DistributionFactoryInstance.createDistribution(
                [rewardTokenInstance.address],
                ["0x0000000000000000000000000000000000000000"],
                ["1"],
                Math.floor(Date.now() / 1000) + 1000,
                Math.floor(Date.now() / 1000) + 2000,
                false
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprERC20DistributionFactory: invalid reward tokens"
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
            await swaprERC20DistributionFactoryInstance.createDistribution(
                [rewardTokenInstance.address],
                ["0x0000000000000000000000000000000000000000"],
                ["1"],
                Math.floor(Date.now() / 1000) + 1000,
                Math.floor(Date.now() / 1000) + 2000,
                false
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprERC20DistributionFactory: invalid stakable tokens"
            );
        }
    });

    it("should fail when trying to create a distribution with an unlisted stakable token", async () => {
        try {
            // setting valid list on reward tokens validator
            await dxTokenRegistryInstance.addList("test");
            await dxTokenRegistryInstance.addTokens(1, [
                rewardTokenInstance.address,
            ]);
            await defaultRewardTokensValidatorInstance.setDxTokenRegistryListId(
                1,
                { from: ownerAddress }
            );
            // setting valid list on stakable tokens validator
            await defaultStakableTokensValidatorInstance.setDxTokenRegistryListId(
                1,
                { from: ownerAddress }
            );
            await swaprERC20DistributionFactoryInstance.createDistribution(
                [rewardTokenInstance.address],
                [firstStakableTokenInstance.address],
                ["1"],
                Math.floor(Date.now() / 1000) + 1000,
                Math.floor(Date.now() / 1000) + 2000,
                false
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprERC20DistributionFactory: invalid stakable tokens"
            );
        }
    });

    it("should fail when trying to create a distribution with an listed stakable token that is not a swapr pair", async () => {
        try {
            // listing reward token so that validation passes
            await dxTokenRegistryInstance.addList("test");
            await dxTokenRegistryInstance.addTokens(1, [
                rewardTokenInstance.address,
            ]);
            // listing the stakable token
            await dxTokenRegistryInstance.addTokens(1, [
                firstStakableTokenInstance.address,
            ]);
            // creating
            await swaprERC20DistributionFactoryInstance.createDistribution(
                [rewardTokenInstance.address],
                [firstStakableTokenInstance.address],
                ["1"],
                Math.floor(Date.now() / 1000) + 1000,
                Math.floor(Date.now() / 1000) + 2000,
                false
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprERC20DistributionFactory: invalid stakable tokens"
            );
        }
    });

    it("should fail when trying to create a distribution with a stakable token that represents a swapr pair with only one listed token out of two in it", async () => {
        try {
            // listing reward token so that validation passes
            await dxTokenRegistryInstance.addList("test");
            await dxTokenRegistryInstance.addTokens(1, [
                rewardTokenInstance.address,
            ]);
            // listing only one stakable token
            await dxTokenRegistryInstance.addTokens(1, [
                firstStakableTokenInstance.address,
            ]);
            // setting validation token list to correct id for validators. This has
            // already been done in the before each hook, but redoing it here for
            // clarity
            await defaultRewardTokensValidatorInstance.setDxTokenRegistryListId(
                1,
                { from: ownerAddress }
            );
            await defaultStakableTokensValidatorInstance.setDxTokenRegistryListId(
                1,
                { from: ownerAddress }
            );
            // creating pair on swapr. Only the first token is actually listed
            const { logs } = await dxSwapFactoryInstance.createPair(
                firstStakableTokenInstance.address,
                secondStakableTokenInstance.address
            );
            const createdPairAddress = logs.find(
                (log) => log.event === "PairCreated"
            ).address;
            await swaprERC20DistributionFactoryInstance.createDistribution(
                [rewardTokenInstance.address],
                [createdPairAddress],
                ["1"],
                Math.floor(Date.now() / 1000) + 1000,
                Math.floor(Date.now() / 1000) + 2000,
                false
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprERC20DistributionFactory: invalid stakable tokens"
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
        // creating pair on swapr. Both tokens are listed
        const { logs } = await dxSwapFactoryInstance.createPair(
            firstStakableTokenInstance.address,
            secondStakableTokenInstance.address
        );
        const { pair: createdPairAddress } = logs.find(
            (log) => log.event === "PairCreated"
        ).args;
        const expectedToken0 =
            parseInt(firstStakableTokenInstance.address, 16) <
            parseInt(secondStakableTokenInstance.address, 16)
                ? firstStakableTokenInstance.address
                : secondStakableTokenInstance.address;
        const expectedToken1 =
            parseInt(firstStakableTokenInstance.address, 16) >=
            parseInt(secondStakableTokenInstance.address, 16)
                ? firstStakableTokenInstance.address
                : secondStakableTokenInstance.address;
        const createdPairInstance = await DXswapPair.at(createdPairAddress);
        expect(await createdPairInstance.token0()).to.be.equal(expectedToken0);
        expect(await createdPairInstance.token1()).to.be.equal(expectedToken1);
        expect(await createdPairInstance.factory()).to.be.equal(
            dxSwapFactoryInstance.address
        );
        // minting approving reward tokens to avoid balance and allowance-related fails
        const rewardAmount = new BN(web3.utils.toWei("1"));
        await rewardTokenInstance.mint(ownerAddress, rewardAmount);
        await rewardTokenInstance.approve(
            swaprERC20DistributionFactoryInstance.address,
            rewardAmount,
            { from: ownerAddress }
        );
        const startingTimestamp = new BN(Math.floor(Date.now() / 1000) + 1000);
        const endingTimestamp = new BN(Math.floor(Date.now() / 1000) + 2000);
        const duration = endingTimestamp.sub(startingTimestamp);
        await swaprERC20DistributionFactoryInstance.createDistribution(
            [rewardTokenInstance.address],
            [createdPairAddress],
            [rewardAmount],
            startingTimestamp,
            endingTimestamp,
            false,
            { from: ownerAddress }
        );
        expect(
            await swaprERC20DistributionFactoryInstance.getDistributionsAmount()
        ).to.be.equalBn(new BN(1));
        const erc20DistributionInstance = await ERC20Distribution.at(
            await swaprERC20DistributionFactoryInstance.distributions(0)
        );
        expect(await erc20DistributionInstance.initialized()).to.be.true;

        // reward token related checks
        const onchainRewardTokens = await erc20DistributionInstance.getRewardTokens();
        expect(onchainRewardTokens).to.have.length(1);
        expect(onchainRewardTokens[0]).to.be.equal(rewardTokenInstance.address);
        expect(
            await erc20DistributionInstance.rewardTokenMultiplier(
                rewardTokenInstance.address
            )
        ).to.be.equalBn(new BN(10).pow(await rewardTokenInstance.decimals()));
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
        expect(
            await erc20DistributionInstance.rewardPerSecond(
                rewardTokenInstance.address
            )
        ).to.be.equalBn(new BN(rewardAmount).div(duration));

        // stakable token related checks
        const onchainStakableTokens = await erc20DistributionInstance.getStakableTokens();
        expect(onchainStakableTokens).to.have.length(1);
        expect(onchainStakableTokens[0]).to.be.equal(createdPairAddress);

        const onchainStartingTimestamp = await erc20DistributionInstance.startingTimestamp();
        expect(onchainStartingTimestamp).to.be.equalBn(startingTimestamp);
        const onchainEndingTimestamp = await erc20DistributionInstance.endingTimestamp();
        expect(
            onchainEndingTimestamp.sub(onchainStartingTimestamp)
        ).to.be.equalBn(duration);
    });
});
