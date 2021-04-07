require("../utils/assertion");
const BN = require("bn.js");
const { expect } = require("chai");

const DXTokenRegistry = artifacts.require("DXTokenRegistry");
const DefaultStakableTokenValidator = artifacts.require(
    "DefaultStakableTokenValidator"
);

contract("DefaultStakableTokenValidator", () => {
    let dxTokenRegistryInstance,
        defaultStakableTokensValidatorInstance,
        ownerAddress,
        randomAddress;

    beforeEach(async () => {
        const accounts = await web3.eth.getAccounts();
        ownerAddress = accounts[1];
        randomAddress = accounts[0];
        dxTokenRegistryInstance = await DXTokenRegistry.new();
        defaultStakableTokensValidatorInstance = await DefaultStakableTokenValidator.new(
            dxTokenRegistryInstance.address,
            1,
            { from: ownerAddress }
        );
    });

    it("should fail when trying to deploy the contract with a 0-address token registry", async () => {
        try {
            await DefaultStakableTokenValidator.new(
                "0x0000000000000000000000000000000000000000",
                1,
                { from: ownerAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokenValidator: 0-address token registry address"
            );
        }
    });

    it("should fail when trying to deploy the contract with an invalid token list id", async () => {
        try {
            await DefaultStakableTokenValidator.new(
                dxTokenRegistryInstance.address,
                0,
                { from: ownerAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokenValidator: invalid token list id"
            );
        }
    });

    it("should succeed when trying to deploy the contract with a valid token registry address and token list id", async () => {
        const instance = await DefaultStakableTokenValidator.new(
            dxTokenRegistryInstance.address,
            1,
            { from: ownerAddress }
        );
        expect(await instance.dxTokenRegistry()).to.be.equal(
            dxTokenRegistryInstance.address
        );
        expect(await instance.dxTokenRegistryListId()).to.be.equalBn(new BN(1));
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
                "DefaultStakableTokenValidator: 0-address token registry address"
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
                "DefaultStakableTokenValidator: invalid token list id"
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

    it("should signal stakable tokens as invalid if a 0-address token is passed", async () => {
        try {
            await defaultStakableTokensValidatorInstance.validateToken(
                "0x0000000000000000000000000000000000000000"
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokenValidator: 0-address stakable token"
            );
        }
    });
});
