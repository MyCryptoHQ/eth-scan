import { decode, toNumber } from '@findeth/abi';
import { BATCH_SIZE, CONTRACT_ADDRESS } from './constants';
import { call, ProviderLike } from './providers';
import { BalanceMap, EthScanOptions, Result } from './types';
import { batch } from './utils';

/**
 * Get a balance map from an array of addresses and an array of balances.
 *
 * @param {string[]} addresses
 * @param {bigint[]} results
 * @return {BalanceMap}
 */
export const toBalanceMap = (addresses: string[], results: Array<bigint | Result>): BalanceMap => {
  return results.reduce<BalanceMap>((current, next, index) => {
    const value = typeof next === 'bigint' ? next : toNumber(next[1]);

    return {
      ...current,
      [addresses[index]]: value
    };
  }, {});
};

/**
 * Get a nested balance map from an array of addresses, token addresses, and results.
 *
 * @param {string[]} addresses
 * @param {bigint[]} tokenAddresses
 * @param {BalanceMap<BalanceMap>} results
 */
export const toNestedBalanceMap = (
  addresses: string[],
  tokenAddresses: string[],
  results: Array<Array<bigint | Result>>
): BalanceMap<BalanceMap> => {
  return results.reduce<BalanceMap<BalanceMap>>((current, next, index) => {
    return {
      ...current,
      [addresses[index]]: toBalanceMap(tokenAddresses, next)
    };
  }, {});
};

/**
 * Low level API function to send a contract call that returns a single uint256 array.
 *
 * @param {ProviderLike} provider
 * @param {string[]} addresses
 * @param {Function} encodeData
 * @param {EthScanOptions} options
 * @return {Promise<BalanceMap>}
 */
export const callSingle = async (
  provider: ProviderLike,
  addresses: string[],
  encodeData: (addresses: string[]) => string,
  options?: EthScanOptions
): Promise<Result[]> => {
  const contractAddress = options?.contractAddress ?? CONTRACT_ADDRESS;
  const batchSize = options?.batchSize ?? BATCH_SIZE;

  return batch(
    async (batchedAddresses: string[]) => {
      const data = encodeData(batchedAddresses);
      const buffer = await call(provider, contractAddress, data);

      return decode(['(bool,bytes)[]'], buffer)[0] as Result[];
    },
    batchSize,
    addresses
  );
};

export const callMultiple = async (
  provider: ProviderLike,
  addresses: string[],
  otherAddresses: string[],
  encodeData: (addresses: string[], otherAddresses: string[]) => string,
  options?: EthScanOptions
): Promise<Result[][]> => {
  const contractAddress = options?.contractAddress ?? CONTRACT_ADDRESS;
  const batchSize = options?.batchSize ?? BATCH_SIZE;

  return batch(
    async (batchedAddresses: string[]) => {
      const data = encodeData(batchedAddresses, otherAddresses);

      return decode(['(bool,bytes))[][]'], await call(provider, contractAddress, data))[0] as Result[][];
    },
    batchSize,
    addresses
  );
};
