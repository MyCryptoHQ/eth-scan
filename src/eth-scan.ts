import { batch, decode, encodeWithId } from './utils';
import {
  BATCH_SIZE,
  CONTRACT_ADDRESS,
  ETHER_BALANCES_ID,
  ETHER_BALANCES_TYPE,
  TOKEN_BALANCES_ID,
  TOKEN_BALANCES_TYPE,
  TOKENS_BALANCE_ID,
  TOKENS_BALANCE_TYPE,
  TOKENS_BALANCES_ID,
  TOKENS_BALANCES_TYPE
} from './constants';
import { call, ProviderLike } from './providers';

/**
 * An object that contains the address (key) and balance or balance (value).
 */
export interface BalanceMap<T = bigint> {
  [key: string]: T;
}

export interface EthScanOptions {
  /**
   * The address of the contract to use. Defaults to 0xbb4AAaF8cAA1A575B43E7673e5b155C1c5A8BC13.
   */
  contractAddress?: string;

  /**
   * It's not possible to check thousands of addresses at the same time, due to gas limitations.
   * Calls are split per `batchSize` addresses, by default set to 1000.
   */
  batchSize?: number;
}

/**
 * Get the Ether balances for the addresses specified.
 *
 * @param {ProviderLike} provider
 * @param {string[]} addresses
 * @param {EthScanOptions} options
 * @return {Promise<BalanceMap>}
 */
export const getEtherBalances = async (
  provider: ProviderLike,
  addresses: string[],
  options?: EthScanOptions
): Promise<BalanceMap> => {
  const contractAddress = options?.contractAddress ?? CONTRACT_ADDRESS;
  const batchSize = options?.batchSize ?? BATCH_SIZE;

  const balances = await batch(
    async (batchedAddresses: string[]) => {
      const data = encodeWithId(ETHER_BALANCES_ID, ETHER_BALANCES_TYPE, batchedAddresses);

      return decode<[bigint[]]>(['uint256[]'], await call(provider, contractAddress, data))[0];
    },
    batchSize,
    addresses
  );

  return toBalanceMap(addresses, balances);
};

/**
 * Get the ERC-20 token balances of the token with the address `tokenAddress` for the addresses
 * specified.
 *
 * @param {ProviderLike} provider
 * @param {string[]} addresses
 * @param {string} tokenAddress
 * @param {EthScanOptions} options
 * @return {Promise<BalanceMap>}
 */
export const getTokenBalances = async (
  provider: ProviderLike,
  addresses: string[],
  tokenAddress: string,
  options?: EthScanOptions
): Promise<BalanceMap> => {
  const contractAddress = options?.contractAddress ?? CONTRACT_ADDRESS;
  const batchSize = options?.batchSize ?? BATCH_SIZE;

  const balances = await batch(
    async (batchedAddresses: string[]) => {
      const data = encodeWithId(
        TOKEN_BALANCES_ID,
        TOKEN_BALANCES_TYPE,
        batchedAddresses,
        tokenAddress
      );

      return decode<[bigint[]]>(['uint256[]'], await call(provider, contractAddress, data))[0];
    },
    batchSize,
    addresses
  );

  return toBalanceMap(addresses, balances);
};

/**
 * Get the ERC-20 token balances for multiple contracts, for multiple addresses. Note that this may fail if there are
 * too many addresses or tokens, and the batch size is too large.
 *
 * @param {ProviderLike} provider
 * @param {string[]} addresses
 * @param {string[]} tokenAddresses
 * @param {EthScanOptions} options
 * @return {Promise<BalanceMap<BalanceMap>>}
 */
export const getTokensBalances = async (
  provider: ProviderLike,
  addresses: string[],
  tokenAddresses: string[],
  options?: EthScanOptions
): Promise<BalanceMap<BalanceMap>> => {
  const contractAddress = options?.contractAddress ?? CONTRACT_ADDRESS;
  const batchSize = options?.batchSize ?? BATCH_SIZE;

  const balances = await batch<bigint[]>(
    async (batchedAddresses: string[]) => {
      const data = encodeWithId(
        TOKENS_BALANCES_ID,
        TOKENS_BALANCES_TYPE,
        batchedAddresses,
        tokenAddresses
      );

      return decode<[bigint[][]]>(['uint256[][]'], await call(provider, contractAddress, data))[0];
    },
    batchSize,
    addresses
  );

  return toNestedBalanceMap(addresses, tokenAddresses, balances);
};

/**
 * Get the ERC-20 token balance of the tokens with the addresses `tokenAddresses` for the single
 * address specified.
 *
 * @param {ProviderLike} provider
 * @param {string} address
 * @param {string[]} tokenAddresses
 * @param {EthScanOptions} options
 * @return {Promise<BalanceMap>}
 */
export const getTokensBalance = async (
  provider: ProviderLike,
  address: string,
  tokenAddresses: string[],
  options?: EthScanOptions
): Promise<BalanceMap> => {
  const contractAddress = options?.contractAddress ?? CONTRACT_ADDRESS;
  const batchSize = options?.batchSize ?? BATCH_SIZE;

  const balances = await batch(
    async (batchedAddresses: string[]) => {
      const data = encodeWithId(TOKENS_BALANCE_ID, TOKENS_BALANCE_TYPE, address, batchedAddresses);

      return decode<[bigint[]]>(['uint256[]'], await call(provider, contractAddress, data))[0];
    },
    batchSize,
    tokenAddresses
  );

  return toBalanceMap(tokenAddresses, balances);
};

/**
 * Get a balance map from an array of addresses and an array of balances.
 *
 * @param {string[]} addresses
 * @param {bigint[]} balances
 * @return {BalanceMap}
 */
export const toBalanceMap = (addresses: string[], balances: bigint[]): BalanceMap => {
  return balances.reduce<BalanceMap>((current, next, index) => {
    return {
      ...current,
      [addresses[index]]: next
    };
  }, {});
};

/**
 * Get a nested balance map from an array of addresses, token addresses, and balances.
 *
 * @param {string[]} addresses
 * @param {bigint[]} tokenAddresses
 * @param {BalanceMap<BalanceMap>} balances
 */
export const toNestedBalanceMap = (
  addresses: string[],
  tokenAddresses: string[],
  balances: bigint[][]
): BalanceMap<BalanceMap> => {
  return balances.reduce<BalanceMap<BalanceMap>>((current, next, index) => {
    return {
      ...current,
      [addresses[index]]: toBalanceMap(tokenAddresses, next)
    };
  }, {});
};
