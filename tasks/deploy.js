const { task } = require("hardhat/config");

task(
    "deploy",
    "Deploys the whole contracts suite and verifies source code on Etherscan"
)
    .addParam("tokenRegistryAddress", "The token registry address")
    .addParam(
        "tokenRegistryListId",
        "The token registry list id to be used to validate tokens"
    )
    .addParam("factoryAddress", "The address of Swapr's pairs factory")
    .addFlag(
        "verify",
        "Additional (and optional) Etherscan contracts verification"
    )
    .setAction(async (taskArguments, hre) => {
        const {
            tokenRegistryAddress,
            tokenRegistryListId,
            factoryAddress,
            verify,
        } = taskArguments;

        await hre.run("clean");
        await hre.run("compile");

        const DefaultRewardTokensValidator = hre.artifacts.require(
            "DefaultRewardTokensValidator"
        );
        const rewardTokensValidator = await DefaultRewardTokensValidator.new(
            tokenRegistryAddress,
            tokenRegistryListId
        );

        const DefaultStakableTokenValidator = hre.artifacts.require(
            "DefaultStakableTokenValidator"
        );
        const stakableTokenValidator = await DefaultStakableTokenValidator.new(
            tokenRegistryAddress,
            tokenRegistryListId,
            factoryAddress
        );

        const SwaprERC20StakingRewardsDistributionFactory = hre.artifacts.require(
            "SwaprERC20StakingRewardsDistributionFactory"
        );
        const factory = await SwaprERC20StakingRewardsDistributionFactory.new(
            rewardTokensValidator.address,
            stakableTokenValidator.address
        );

        console.log(
            `reward tokens validator deployed at address ${rewardTokensValidator.address}`
        );
        console.log(
            `stakable token validator deployed at address ${stakableTokenValidator.address}`
        );
        console.log(`factory deployed at address ${factory.address}`);

        if (verify) {
            await hre.run("verify", {
                address: rewardTokensValidator.address,
                constructorArguments: [
                    tokenRegistryAddress,
                    tokenRegistryListId,
                ],
            });

            await hre.run("verify", {
                address: stakableTokenValidator.address,
                constructorArguments: [
                    tokenRegistryAddress,
                    tokenRegistryListId,
                    factoryAddress,
                ],
            });
            await hre.run("verify", {
                address: factory.address,
                constructorArguments: [
                    rewardTokensValidator.address,
                    stakableTokenValidator.address,
                ],
            });
            console.log(`source code verified`);
        }
    });
