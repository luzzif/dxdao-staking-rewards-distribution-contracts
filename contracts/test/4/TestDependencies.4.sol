//SPDX-License-Identifier: GPL-3.0

pragma solidity =0.5.16;

import "dxswap-core/contracts/DXswapFactory.sol";
import "dxswap-core/contracts/DXswapPair.sol";

contract FakeDXswapPair is DXswapPair {
    constructor(address _token0, address _token1) public {
        token0 = _token0;
        token1 = _token1;
    }
}

contract FailingToken0GetterDXswapPair {
    address public token1;

    constructor(address _token1) public {
        token1 = _token1;
    }

    function token0() external view returns (address) {
        revert("failed");
    }
}

contract FailingToken1GetterDXswapPair {
    address public token0;

    constructor(address _token0) public {
        token0 = _token0;
    }

    function token1() external view returns (address) {
        revert("failed");
    }
}
