require("../utils/assertion");
const BN = require("bn.js");
const { expect } = require("chai");
const { createSwaprPair, getOrderedTokensInPair } = require("../utils");

const FirstStakableERC20 = artifacts.require("FirstStakableERC20");
const SecondStakableERC20 = artifacts.require("SecondStakableERC20");
const DXTokenRegistry = artifacts.require("DXTokenRegistry");
const DefaultStakableTokensValidator = artifacts.require(
    "DefaultStakableTokensValidator"
);
const DXswapFactory = artifacts.require("DXswapFactory");
const FakeDXswapPair = artifacts.require("FakeDXswapPair");
const FailingToken0GetterDXswapPair = artifacts.require(
    "FailingToken0GetterDXswapPair"
);
const FailingToken1GetterDXswapPair = artifacts.require(
    "FailingToken1GetterDXswapPair"
);

contract("DefaultStakableTokensValidator", () => {
    let dxTokenRegistryInstance,
        dxSwapFactoryInstance,
        firstStakableTokenInstance,
        secondStakableTokenInstance,
        defaultStakableTokensValidatorInstance,
        ownerAddress,
        randomAddress;

    beforeEach(async () => {
        const accounts = await web3.eth.getAccounts();
        ownerAddress = accounts[1];
        randomAddress = accounts[0];
        firstStakableTokenInstance = await FirstStakableERC20.new();
        secondStakableTokenInstance = await SecondStakableERC20.new();
        dxTokenRegistryInstance = await DXTokenRegistry.new();
        dxSwapFactoryInstance = await DXswapFactory.new(
            "0x0000000000000000000000000000000000000000"
        );
        defaultStakableTokensValidatorInstance = await DefaultStakableTokensValidator.new(
            dxTokenRegistryInstance.address,
            1,
            dxSwapFactoryInstance.address,
            { from: ownerAddress }
        );
    });

    it("should fail when trying to deploy the contract with a 0-address token registry", async () => {
        try {
            await DefaultStakableTokensValidator.new(
                "0x0000000000000000000000000000000000000000",
                1,
                dxSwapFactoryInstance.address,
                { from: ownerAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokensValidator: 0-address token registry address"
            );
        }
    });

    it("should fail when trying to deploy the contract with an invalid token list id", async () => {
        try {
            await DefaultStakableTokensValidator.new(
                dxTokenRegistryInstance.address,
                0,
                dxSwapFactoryInstance.address,
                { from: ownerAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokensValidator: invalid token list id"
            );
        }
    });

    it("should fail when trying to deploy the contract with a 0-address factory address", async () => {
        try {
            await DefaultStakableTokensValidator.new(
                dxTokenRegistryInstance.address,
                1,
                "0x0000000000000000000000000000000000000000",
                { from: ownerAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokensValidator: 0-address factory address"
            );
        }
    });

    it("should succeed when trying to deploy the contract with an valid token registry address, token list id and factory", async () => {
        const instance = await DefaultStakableTokensValidator.new(
            dxTokenRegistryInstance.address,
            1,
            dxSwapFactoryInstance.address,
            { from: ownerAddress }
        );
        expect(await instance.dxTokenRegistry()).to.be.equal(
            dxTokenRegistryInstance.address
        );
        expect(await instance.dxTokenRegistryListId()).to.be.equalBn(new BN(1));
        expect(await instance.dxSwapFactory()).to.be.equal(
            dxSwapFactoryInstance.address
        );
        expect(await instance.owner()).to.be.equal(ownerAddress);
    });

    it("should fail when a non-owner tries to set a new dx token registry address", async () => {
        try {
            await defaultStakableTokensValidatorInstance.setDxTokenRegistry(
                dxTokenRegistryInstance.address,
                { from: randomAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "Ownable: caller is not the owner"
            );
        }
    });

    it("should fail when the owner tries to set a 0-address dx token registry", async () => {
        try {
            await defaultStakableTokensValidatorInstance.setDxTokenRegistry(
                "0x0000000000000000000000000000000000000000",
                { from: ownerAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokensValidator: 0-address token registry address"
            );
        }
    });

    it("should succeed when the owner tries to set a valid address as the dx token registry one", async () => {
        expect(
            await defaultStakableTokensValidatorInstance.dxTokenRegistry()
        ).to.be.equal(dxTokenRegistryInstance.address);
        const newDxTokenRegistryAddress =
            "0x0000000000000000000000000000000000000aBc";
        await defaultStakableTokensValidatorInstance.setDxTokenRegistry(
            newDxTokenRegistryAddress,
            { from: ownerAddress }
        );
        expect(
            await defaultStakableTokensValidatorInstance.dxTokenRegistry()
        ).to.be.equal(newDxTokenRegistryAddress);
    });

    it("should fail when a non-owner tries to set a new token list id", async () => {
        try {
            await defaultStakableTokensValidatorInstance.setDxTokenRegistryListId(
                1,
                { from: randomAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "Ownable: caller is not the owner"
            );
        }
    });

    it("should fail when the owner tries to set an invalid token list id", async () => {
        try {
            await defaultStakableTokensValidatorInstance.setDxTokenRegistryListId(
                0,
                { from: ownerAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokensValidator: invalid token list id"
            );
        }
    });

    it("should succeed when the owner tries to set a valid token list id", async () => {
        expect(
            await defaultStakableTokensValidatorInstance.dxTokenRegistryListId()
        ).to.be.equalBn(new BN(1));
        await defaultStakableTokensValidatorInstance.setDxTokenRegistryListId(
            10,
            { from: ownerAddress }
        );
        expect(
            await defaultStakableTokensValidatorInstance.dxTokenRegistryListId()
        ).to.be.equalBn(new BN(10));
    });

    it("should fail when a non-owner tries to set a new dxswap factory address", async () => {
        try {
            await defaultStakableTokensValidatorInstance.setDxSwapFactory(
                dxSwapFactoryInstance.address,
                { from: randomAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "Ownable: caller is not the owner"
            );
        }
    });

    it("should fail when the owner tries to set an invalid dxswap factory address", async () => {
        try {
            await defaultStakableTokensValidatorInstance.setDxSwapFactory(
                "0x0000000000000000000000000000000000000000",
                { from: ownerAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokensValidator: 0-address factory address"
            );
        }
    });

    it("should succeed when the owner tries to set a valid dxswap factory address", async () => {
        expect(
            await defaultStakableTokensValidatorInstance.dxSwapFactory()
        ).to.be.equal(dxSwapFactoryInstance.address);
        const newAddress = "0x0000000000000000000000000000000000000aBc";
        await defaultStakableTokensValidatorInstance.setDxSwapFactory(
            newAddress,
            { from: ownerAddress }
        );
        expect(
            await defaultStakableTokensValidatorInstance.dxSwapFactory()
        ).to.be.equal(newAddress);
    });

    it("should signal stakable tokens as invalid if an empty array is passed", async () => {
        try {
            await defaultStakableTokensValidatorInstance.validateTokens([]);
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokensValidator: 0-length stakable tokens array"
            );
        }
    });

    it("should signal stakable tokens as invalid if a single 0-address token is passed in the array", async () => {
        try {
            await defaultStakableTokensValidatorInstance.validateTokens([
                "0x0000000000000000000000000000000000000000",
            ]);
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokensValidator: 0-address stakable token"
            );
        }
    });

    it("should signal stakable tokens as invalid if a single 0-address token is passed in the array after a non-0-address token", async () => {
        // the tokens that form the pair must both be listed
        await dxTokenRegistryInstance.addList("test");
        await dxTokenRegistryInstance.addTokens(1, [
            firstStakableTokenInstance.address,
        ]);
        await dxTokenRegistryInstance.addTokens(1, [
            secondStakableTokenInstance.address,
        ]);
        // the first token needs to be valid, so we created a swapr pair
        const lpTokenAddress = await createSwaprPair(
            dxSwapFactoryInstance,
            firstStakableTokenInstance.address,
            secondStakableTokenInstance.address
        );
        await defaultStakableTokensValidatorInstance.setDxTokenRegistryListId(
            1,
            { from: ownerAddress }
        );
        try {
            await defaultStakableTokensValidatorInstance.validateTokens([
                lpTokenAddress,
                "0x0000000000000000000000000000000000000000",
            ]);
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokensValidator: 0-address stakable token"
            );
        }
    });

    it("should signal stakable tokens as invalid if a single non-lp token is passed in the array", async () => {
        try {
            await defaultStakableTokensValidatorInstance.validateTokens([
                firstStakableTokenInstance.address,
            ]);
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokensValidator: could not get factory address for pair"
            );
        }
    });

    it("should signal stakable tokens as invalid if a single non-lp token is passed in the array after a correct one", async () => {
        await dxTokenRegistryInstance.addList("test");
        await dxTokenRegistryInstance.addTokens(1, [
            firstStakableTokenInstance.address,
        ]);
        await dxTokenRegistryInstance.addTokens(1, [
            secondStakableTokenInstance.address,
        ]);
        const lpTokenAddress = await createSwaprPair(
            dxSwapFactoryInstance,
            firstStakableTokenInstance.address,
            secondStakableTokenInstance.address
        );
        try {
            await defaultStakableTokensValidatorInstance.validateTokens([
                lpTokenAddress,
                firstStakableTokenInstance.address,
            ]);
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokensValidator: could not get factory address for pair"
            );
        }
    });

    it("should signal stakable tokens as invalid if a single invalid-factory token is passed in the array", async () => {
        const fakeDxswapFactoryInstance = await DXswapFactory.new(
            "0x0000000000000000000000000000000000000000"
        );
        await dxTokenRegistryInstance.addList("test");
        await dxTokenRegistryInstance.addTokens(1, [
            firstStakableTokenInstance.address,
        ]);
        await dxTokenRegistryInstance.addTokens(1, [
            secondStakableTokenInstance.address,
        ]);
        const lpTokenAddress = await createSwaprPair(
            fakeDxswapFactoryInstance,
            firstStakableTokenInstance.address,
            secondStakableTokenInstance.address
        );
        await defaultStakableTokensValidatorInstance.setDxTokenRegistryListId(
            1,
            { from: ownerAddress }
        );
        try {
            await defaultStakableTokensValidatorInstance.validateTokens([
                lpTokenAddress,
            ]);
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokensValidator: invalid factory address for stakable token"
            );
        }
    });

    it("should signal stakable tokens as invalid if a valid stakable token is passed in alongside an invalid-factory token in the array", async () => {
        const fakeDxswapFactoryInstance = await DXswapFactory.new(
            "0x0000000000000000000000000000000000000000"
        );
        await dxTokenRegistryInstance.addList("test");
        await dxTokenRegistryInstance.addTokens(1, [
            firstStakableTokenInstance.address,
        ]);
        await dxTokenRegistryInstance.addTokens(1, [
            secondStakableTokenInstance.address,
        ]);
        const fakeLpTokenAddress = await createSwaprPair(
            fakeDxswapFactoryInstance,
            firstStakableTokenInstance.address,
            secondStakableTokenInstance.address
        );
        const validLpTokenAddress = await createSwaprPair(
            dxSwapFactoryInstance,
            firstStakableTokenInstance.address,
            secondStakableTokenInstance.address
        );
        await defaultStakableTokensValidatorInstance.setDxTokenRegistryListId(
            1,
            { from: ownerAddress }
        );
        try {
            await defaultStakableTokensValidatorInstance.validateTokens([
                validLpTokenAddress,
                fakeLpTokenAddress,
            ]);
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokensValidator: invalid factory address for stakable token"
            );
        }
    });

    it("should signal stakable tokens as invalid if a pair with only the token0 listed is passed in the array", async () => {
        await dxTokenRegistryInstance.addList("test");
        const { token0Address, token1Address } = getOrderedTokensInPair(
            firstStakableTokenInstance.address,
            secondStakableTokenInstance.address
        );
        // only the token0 is listed
        await dxTokenRegistryInstance.addTokens(1, [token0Address]);
        const lpTokenAddress = await createSwaprPair(
            dxSwapFactoryInstance,
            token0Address,
            token1Address
        );
        await defaultStakableTokensValidatorInstance.setDxTokenRegistryListId(
            1,
            { from: ownerAddress }
        );
        try {
            await defaultStakableTokensValidatorInstance.validateTokens([
                lpTokenAddress,
            ]);
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokensValidator: invalid token 1 in Swapr pair"
            );
        }
    });

    it("should signal stakable tokens as invalid if a pair with only the token1 listed is passed in the array", async () => {
        await dxTokenRegistryInstance.addList("test");
        const { token0Address, token1Address } = getOrderedTokensInPair(
            firstStakableTokenInstance.address,
            secondStakableTokenInstance.address
        );
        // only the token0 is listed
        await dxTokenRegistryInstance.addTokens(1, [token1Address]);
        const lpTokenAddress = await createSwaprPair(
            dxSwapFactoryInstance,
            token0Address,
            token1Address
        );
        await defaultStakableTokensValidatorInstance.setDxTokenRegistryListId(
            1,
            { from: ownerAddress }
        );
        try {
            await defaultStakableTokensValidatorInstance.validateTokens([
                lpTokenAddress,
            ]);
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokensValidator: invalid token 0 in Swapr pair"
            );
        }
    });

    it("should mark the stakable tokens as invalid if the array contains a fake lp which passes every check but is not registered in the official factory", async () => {
        await dxTokenRegistryInstance.addList("test");
        const { token0Address, token1Address } = getOrderedTokensInPair(
            firstStakableTokenInstance.address,
            secondStakableTokenInstance.address
        );
        // list both tokens
        await dxTokenRegistryInstance.addTokens(1, [
            token0Address,
            token1Address,
        ]);
        const fakePairInstance = await FakeDXswapPair.new(
            dxSwapFactoryInstance.address,
            token0Address,
            token1Address
        );
        await defaultStakableTokensValidatorInstance.setDxTokenRegistryListId(
            1,
            { from: ownerAddress }
        );
        try {
            await defaultStakableTokensValidatorInstance.validateTokens([
                fakePairInstance.address,
            ]);
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokensValidator: pair not registered in factory"
            );
        }
    });

    it("should mark the stakable tokens as invalid if the array contains a fake lp which passes every check but fails when getting the token0", async () => {
        await dxTokenRegistryInstance.addList("test");
        const { token0Address, token1Address } = getOrderedTokensInPair(
            firstStakableTokenInstance.address,
            secondStakableTokenInstance.address
        );
        // list both tokens
        await dxTokenRegistryInstance.addTokens(1, [
            token0Address,
            token1Address,
        ]);
        const fakePairInstance = await FailingToken0GetterDXswapPair.new(
            dxSwapFactoryInstance.address,
            token1Address
        );
        await defaultStakableTokensValidatorInstance.setDxTokenRegistryListId(
            1,
            { from: ownerAddress }
        );
        try {
            await defaultStakableTokensValidatorInstance.validateTokens([
                fakePairInstance.address,
            ]);
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokensValidator: could not get token0 for pair"
            );
        }
    });

    it("should mark the stakable tokens as invalid if the array contains a fake lp which passes every check but fails when getting the token1", async () => {
        await dxTokenRegistryInstance.addList("test");
        const { token0Address, token1Address } = getOrderedTokensInPair(
            firstStakableTokenInstance.address,
            secondStakableTokenInstance.address
        );
        // list both tokens
        await dxTokenRegistryInstance.addTokens(1, [
            token0Address,
            token1Address,
        ]);
        const fakePairInstance = await FailingToken1GetterDXswapPair.new(
            dxSwapFactoryInstance.address,
            token0Address
        );
        await defaultStakableTokensValidatorInstance.setDxTokenRegistryListId(
            1,
            { from: ownerAddress }
        );
        try {
            await defaultStakableTokensValidatorInstance.validateTokens([
                fakePairInstance.address,
            ]);
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokensValidator: could not get token1 for pair"
            );
        }
    });

    it("should mark the stakable tokens as valid if the array contains an lp token related to a pair where both tokens are listed", async () => {
        await dxTokenRegistryInstance.addList("test");
        const token0 =
            parseInt(firstStakableTokenInstance.address, 16) <
            parseInt(secondStakableTokenInstance.address, 16)
                ? firstStakableTokenInstance.address
                : secondStakableTokenInstance.address;
        const token1 =
            parseInt(firstStakableTokenInstance.address, 16) >=
            parseInt(secondStakableTokenInstance.address, 16)
                ? firstStakableTokenInstance.address
                : secondStakableTokenInstance.address;
        // list both tokens
        await dxTokenRegistryInstance.addTokens(1, [token0, token1]);
        const lpTokenAddress = await createSwaprPair(
            dxSwapFactoryInstance,
            token0,
            token1
        );
        await defaultStakableTokensValidatorInstance.setDxTokenRegistryListId(
            1,
            { from: ownerAddress }
        );
        await defaultStakableTokensValidatorInstance.validateTokens([
            lpTokenAddress,
        ]);
    });
});
