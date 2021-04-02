// SPDX-License-Identifier: MIT

pragma solidity 0.8.3;

/**
 * @title An Ether or token balance scanner
 * @author Maarten Zuidhoorn
 * @author Luit Hollander
 */
contract BalanceScanner {
  /**
   * @notice Get the Ether balance for all addresses specified
   * @param addresses The addresses to get the Ether balance for
   * @return balances The Ether balance for all addresses in the same order as specified
   */
  function etherBalances(address[] calldata addresses) external view returns (uint256[] memory balances) {
    balances = new uint256[](addresses.length);

    for (uint256 i = 0; i < addresses.length; i++) {
      balances[i] = addresses[i].balance;
    }
  }

  /**
   * @notice Get the ERC-20 token balance of `token` for all addresses specified
   * @dev This does not check if the `token` address specified is actually an ERC-20 token
   * @param addresses The addresses to get the token balance for
   * @param token The address of the ERC-20 token contract
   * @return balances The token balance for all addresses in the same order as specified
   */
  function tokenBalances(address[] calldata addresses, address token)
    external
    view
    returns (uint256[] memory balances)
  {
    balances = new uint256[](addresses.length);

    for (uint256 i = 0; i < addresses.length; i++) {
      bytes memory data = abi.encodeWithSignature("balanceOf(address)", addresses[i]);
      balances[i] = tokenBalance(token, data);
    }
  }

  /**
   * @notice Get the ERC-20 token balance from multiple contracts for a single owner
   * @param owner The address of the token owner
   * @param contracts The addresses of the ERC-20 token contracts
   * @return balances The token balances in the same order as the addresses specified
   */
  function tokensBalance(address owner, address[] calldata contracts) public view returns (uint256[] memory balances) {
    balances = new uint256[](contracts.length);

    bytes memory data = abi.encodeWithSignature("balanceOf(address)", owner);
    for (uint256 i = 0; i < contracts.length; i++) {
      balances[i] = tokenBalance(contracts[i], data);
    }
  }

  /**
   * @notice Call multiple contracts with the provided arbitrary data
   * @param contracts The contracts to call
   * @param data The data to call the contracts with
   * @return output The raw result of the contract calls
   */
  function call(address[] calldata contracts, bytes[] calldata data) public view returns (bytes[] memory output) {
    require(contracts.length == data.length, "Length must be equal");
    output = new bytes[](contracts.length);

    for (uint256 i = 0; i < contracts.length; i++) {
      (bool success, bytes memory result) = staticCall(contracts[i], data[i], gasleft());
      if (success) {
        output[i] = result;
      }
    }
  }

  /**
    * @notice Get the ERC-20 token balance for a single contract
    * @param token The address of the ERC-20 token contract
    * @param data The data to call the token with
    * @return balance The token balance, or zero if the address is not a contract, or does not implement the `balanceOf`
      function. This will also be zero if the target contract tries to modify the state, e.g., when using certain proxy
      contracts
  */
  function tokenBalance(address token, bytes memory data) private view returns (uint256 balance) {
    (bool success, bytes memory result) = staticCall(token, data, 20000);

    if (success) {
      (balance) = abi.decode(result, (uint256));
    }
  }

  /**
   * @notice Static call a contract with the provided data
   * @param target The address of the contract to call
   * @param data The data to call the contract with
   * @return success Whether the call succeeded
   * @return result The returned data from the contract, or an empty byte array if the contract call failed
   */
  function staticCall(
    address target,
    bytes memory data,
    uint256 gas
  ) private view returns (bool success, bytes memory result) {
    uint256 size = codeSize(target);

    if (size > 0) {
      (success, result) = target.staticcall{ gas: gas }(data);
    }
  }

  /**
   * @notice Get code size of address
   * @param _address The address to get code size from
   * @return size Unsigned 256-bits integer
   */
  function codeSize(address _address) private view returns (uint256 size) {
    // solhint-disable-next-line no-inline-assembly
    assembly {
      size := extcodesize(_address)
    }
  }
}
