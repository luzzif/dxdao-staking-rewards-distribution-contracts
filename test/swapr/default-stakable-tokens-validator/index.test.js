require("../../utils/assertion");
const BN = require("bn.js");
const { expect } = require("chai");
const { createSwaprPair, getOrderedTokensInPair } = require("../../utils");

const FirstStakableERC20 = artifacts.require("FirstStakableERC20");
const SecondStakableERC20 = artifacts.require("SecondStakableERC20");
const DXTokenRegistry = artifacts.require("DXTokenRegistry");
const SwaprStakableTokenValidator = artifacts.require(
    "SwaprStakableTokenValidator"
);
const DXswapFactory = artifacts.require("DXswapFactory");
const FakeDXswapPair = artifacts.require("FakeDXswapPair");
const FailingToken0GetterDXswapPair = artifacts.require(
    "FailingToken0GetterDXswapPair"
);
const FailingToken1GetterDXswapPair = artifacts.require(
    "FailingToken1GetterDXswapPair"
);

contract("SwaprStakableTokenValidator", () => {
    let dxTokenRegistryInstance,
        dxSwapFactoryInstance,
        firstStakableTokenInstance,
        secondStakableTokenInstance,
        swaprStakableTokensValidatorInstance,
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
        swaprStakableTokensValidatorInstance = await SwaprStakableTokenValidator.new(
            dxTokenRegistryInstance.address,
            1,
            dxSwapFactoryInstance.address,
            { from: ownerAddress }
        );
    });

    it("should fail when trying to deploy the contract with a 0-address token registry", async () => {
        try {
            await SwaprStakableTokenValidator.new(
                "0x0000000000000000000000000000000000000000",
                1,
                dxSwapFactoryInstance.address,
                { from: ownerAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprStakableTokenValidator: 0-address token registry address"
            );
        }
    });

    it("should fail when trying to deploy the contract with an invalid token list id", async () => {
        try {
            await SwaprStakableTokenValidator.new(
                dxTokenRegistryInstance.address,
                0,
                dxSwapFactoryInstance.address,
                { from: ownerAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprStakableTokenValidator: invalid token list id"
            );
        }
    });

    it("should fail when trying to deploy the contract with a 0-address factory address", async () => {
        try {
            await SwaprStakableTokenValidator.new(
                dxTokenRegistryInstance.address,
                1,
                "0x0000000000000000000000000000000000000000",
                { from: ownerAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprStakableTokenValidator: 0-address factory address"
            );
        }
    });

    it("should succeed when trying to deploy the contract with an valid token registry address, token list id and factory", async () => {
        const instance = await SwaprStakableTokenValidator.new(
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
            await swaprStakableTokensValidatorInstance.setDxTokenRegistry(
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
            await swaprStakableTokensValidatorInstance.setDxTokenRegistry(
                "0x0000000000000000000000000000000000000000",
                { from: ownerAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprStakableTokenValidator: 0-address token registry address"
            );
        }
    });

    it("should succeed when the owner tries to set a valid address as the dx token registry one", async () => {
        expect(
            await swaprStakableTokensValidatorInstance.dxTokenRegistry()
        ).to.be.equal(dxTokenRegistryInstance.address);
        const newDxTokenRegistryAddress =
            "0x0000000000000000000000000000000000000aBc";
        await swaprStakableTokensValidatorInstance.setDxTokenRegistry(
            newDxTokenRegistryAddress,
            { from: ownerAddress }
        );
        expect(
            await swaprStakableTokensValidatorInstance.dxTokenRegistry()
        ).to.be.equal(newDxTokenRegistryAddress);
    });

    it("should fail when a non-owner tries to set a new token list id", async () => {
        try {
            await swaprStakableTokensValidatorInstance.setDxTokenRegistryListId(
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
            await swaprStakableTokensValidatorInstance.setDxTokenRegistryListId(
                0,
                { from: ownerAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprStakableTokenValidator: invalid token list id"
            );
        }
    });

    it("should succeed when the owner tries to set a valid token list id", async () => {
        expect(
            await swaprStakableTokensValidatorInstance.dxTokenRegistryListId()
        ).to.be.equalBn(new BN(1));
        await swaprStakableTokensValidatorInstance.setDxTokenRegistryListId(
            10,
            { from: ownerAddress }
        );
        expect(
            await swaprStakableTokensValidatorInstance.dxTokenRegistryListId()
        ).to.be.equalBn(new BN(10));
    });

    it("should fail when a non-owner tries to set a new dxswap factory address", async () => {
        try {
            await swaprStakableTokensValidatorInstance.setDxSwapFactory(
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
            await swaprStakableTokensValidatorInstance.setDxSwapFactory(
                "0x0000000000000000000000000000000000000000",
                { from: ownerAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprStakableTokenValidator: 0-address factory address"
            );
        }
    });

    it("should succeed when the owner tries to set a valid dxswap factory address", async () => {
        expect(
            await swaprStakableTokensValidatorInstance.dxSwapFactory()
        ).to.be.equal(dxSwapFactoryInstance.address);
        const newAddress = "0x0000000000000000000000000000000000000aBc";
        await swaprStakableTokensValidatorInstance.setDxSwapFactory(
            newAddress,
            { from: ownerAddress }
        );
        expect(
            await swaprStakableTokensValidatorInstance.dxSwapFactory()
        ).to.be.equal(newAddress);
    });

    it("should signal stakable tokens as invalid if a single 0-address token is passed in the array", async () => {
        try {
            await swaprStakableTokensValidatorInstance.validateToken(
                "0x0000000000000000000000000000000000000000"
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprStakableTokenValidator: 0-address stakable token"
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
        await swaprStakableTokensValidatorInstance.setDxTokenRegistryListId(1, {
            from: ownerAddress,
        });
        try {
            await swaprStakableTokensValidatorInstance.validateToken(
                lpTokenAddress
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprStakableTokenValidator: pair not registered in factory"
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
        await swaprStakableTokensValidatorInstance.setDxTokenRegistryListId(1, {
            from: ownerAddress,
        });
        try {
            await swaprStakableTokensValidatorInstance.validateToken(
                lpTokenAddress
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprStakableTokenValidator: invalid token 1 in Swapr pair"
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
        await swaprStakableTokensValidatorInstance.setDxTokenRegistryListId(1, {
            from: ownerAddress,
        });
        try {
            await swaprStakableTokensValidatorInstance.validateToken(
                lpTokenAddress
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprStakableTokenValidator: invalid token 0 in Swapr pair"
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
            token0Address,
            token1Address
        );
        await swaprStakableTokensValidatorInstance.setDxTokenRegistryListId(1, {
            from: ownerAddress,
        });
        try {
            await swaprStakableTokensValidatorInstance.validateToken(
                fakePairInstance.address
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprStakableTokenValidator: pair not registered in factory"
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
            token1Address
        );
        await swaprStakableTokensValidatorInstance.setDxTokenRegistryListId(1, {
            from: ownerAddress,
        });
        try {
            await swaprStakableTokensValidatorInstance.validateToken(
                fakePairInstance.address
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprStakableTokenValidator: could not get token0 for pair"
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
            token0Address
        );
        await swaprStakableTokensValidatorInstance.setDxTokenRegistryListId(1, {
            from: ownerAddress,
        });
        try {
            await swaprStakableTokensValidatorInstance.validateToken(
                fakePairInstance.address
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "SwaprStakableTokenValidator: could not get token1 for pair"
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
        await swaprStakableTokensValidatorInstance.setDxTokenRegistryListId(1, {
            from: ownerAddress,
        });
        await swaprStakableTokensValidatorInstance.validateToken(
            lpTokenAddress
        );
    });
});
