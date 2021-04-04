// SPDX-License-Identifier: MIT

pragma solidity 0.8.3;

import "./ERC20Mock.sol";

contract ERC20InvalidMock is ERC20Mock {
  address public sender;

  constructor(address initialAccount, uint256 initialBalance) payable ERC20Mock(initialAccount, initialBalance) {
    // noop
  }

  /**
   * @dev This function is not ERC-20 compliant and will cause STATICCALLs to fail. It exists for testing purposes only.
   */
  function balanceOf(address account) public override returns (uint256) {
    setSender(msg.sender);
    return super.balanceOf(account);
  }

  function setSender(address _sender) private {
    sender = _sender;
  }
}
