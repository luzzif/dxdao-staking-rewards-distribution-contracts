# DXdao staking rewards distribution contracts

A contract suite to bootstrap staking-based reward campaigns on DXdao products
(to bootstrap liquidity mining campaigns). Can be used for example on Swapr or
Omen.

## Getting started

To use `dxdao-staking-rewards-distribution-contracts` in your project (for
example to extend the functionality of either the distribution contract or the
factory or to simply easily access the contracts' ABI), simply run:

```
yarn add -D `dxdao-staking-rewards-distribution-contracts`
```

Built artifacts (containing ABI and bytecode) can be imported in the following
way:

```js
const factoryArtifact = require("dxdao-staking-rewards-distribution-contracts/build/DXdaoERC20StakingRewardsDistributionFactory.json");
```

Solidity source code can be imported in the following way:

```js
import "dxdao-staking-rewards-distribution-contracts/DXdaoERC20StakingRewardsDistributionFactory.sol";
```

## Development

Start by cloning the repo and installing dependencies by running:

```
yarn
```

To trigger a compilation run:

```
yarn compile
```

Tests will be ran using the Hardhat framework and Hardhat network. They are
divided in suites depending on contract files and execution scenarios. To
trigger a test run, just launch:

```
yarn test
```

These tests won't show any coverage data. In order to show coverage statistics
collected through `solidity-coverage` another command must be launched:

```
yarn test:coverage
```

There is a third variant in the testing process that collects information about
average gas consumption and estimates the cost of calling contracts' functions
based on current gas prices read from ETHGasStation. `hardhat-gas-reporter` is
used to achieve this, and in order to show the aforementioned data, just run:

```
yarn test:gasreport
```

**Warning**: collecting coverage or gas consumption data while performing tests
might slow down the entire process.

Linting and "prettification" on Solidity code is performed using
`prettier-plugin-solidity` and `solhint-plugin-prettier`. Test code is simply
checked using `eslint` and `prettier`.
