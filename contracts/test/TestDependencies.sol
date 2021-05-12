//SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "dxswap-core/contracts/interfaces/IDXswapFactory.sol";
import "dxdao-token-registry/contracts/dxTokenRegistry.sol";
import "erc20-staking-rewards-distribution-contracts/ERC20StakingRewardsDistribution.sol";

contract FirstRewardERC20 is ERC20PresetMinterPauser {
    constructor() ERC20PresetMinterPauser("First reward", "RWD1") {}
}

contract SecondRewardERC20 is ERC20PresetMinterPauser {
    constructor() ERC20PresetMinterPauser("Second reward", "RWD2") {}
}

contract FirstStakableERC20 is ERC20PresetMinterPauser {
    constructor() ERC20PresetMinterPauser("First stakable", "STK1") {}
}

contract SecondStakableERC20 is ERC20PresetMinterPauser {
    constructor() ERC20PresetMinterPauser("Second stakable", "STK2") {}
}
