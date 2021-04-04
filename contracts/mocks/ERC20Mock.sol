// SPDX-License-Identifier: MIT

pragma solidity 0.8.3;

contract ERC20Mock {
  mapping(address => uint256) private balances;

  constructor(address initialAccount, uint256 initialBalance) {
    mint(initialAccount, initialBalance);
  }

  /**
   * @dev The `balanceOf` function should be a view function, but for testing purposes, this function is not. This makes
   * it easy to test non-compliant ERC-20 tokens.
   */
  function balanceOf(address account) public virtual returns (uint256) {
    return balances[account];
  }

  function mint(address account, uint256 amount) public {
    balances[account] += amount;
  }
}
