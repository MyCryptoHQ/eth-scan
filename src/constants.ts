export const CONTRACT_ADDRESS = '0x86f25b64e1fe4c5162cdeed5245575d32ec549db';
export const BATCH_SIZE = 1000;

/**
 * tokenBalances(address[],address)
 */
export const TOKEN_BALANCES_ID = 'aad33091';
export const TOKEN_BALANCES_TYPE = {
  inputs: [
    { internalType: 'address[]', name: 'addresses', type: 'address[]' },
    {
      internalType: 'address',
      name: 'token',
      type: 'address'
    }
  ],
  name: 'tokenBalances',
  outputs: [{ internalType: 'uint256[]', name: 'balances', type: 'uint256[]' }],
  stateMutability: 'nonpayable',
  type: 'function'
};

/**
 * etherBalances(address[])
 */
export const ETHER_BALANCES_ID = 'dbdbb51b';
export const ETHER_BALANCES_TYPE = {
  inputs: [
    {
      internalType: 'address[]',
      name: 'addresses',
      type: 'address[]'
    }
  ],
  name: 'etherBalances',
  outputs: [{ name: 'balances', type: 'uint256[]' }],
  stateMutability: 'view',
  type: 'function'
};

/**
 * tokensBalance(address,address[])
 */
export const TOKENS_BALANCE_ID = 'e5da1b68';
export const TOKENS_BALANCE_TYPE = {
  inputs: [
    { internalType: 'address', name: 'owner', type: 'address' },
    {
      internalType: 'address[]',
      name: 'contracts',
      type: 'address[]'
    }
  ],
  name: 'tokensBalance',
  outputs: [{ internalType: 'uint256[]', name: 'balances', type: 'uint256[]' }],
  stateMutability: 'nonpayable',
  type: 'function'
};

/**
 * tokensBalances(address[],address[])
 */
export const TOKENS_BALANCES_ID = '06187b4f';
export const TOKENS_BALANCES_TYPE = {
  inputs: [
    {
      internalType: 'address[]',
      name: 'addresses',
      type: 'address[]'
    },
    { internalType: 'address[]', name: 'contracts', type: 'address[]' }
  ],
  name: 'tokensBalances',
  outputs: [{ internalType: 'uint256[][]', name: 'balances', type: 'uint256[][]' }],
  stateMutability: 'nonpayable',
  type: 'function'
};
