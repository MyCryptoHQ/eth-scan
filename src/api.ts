import { decode } from '@findeth/abi';
import { BATCH_SIZE, CONTRACT_ADDRESS } from './constants';
import { call, ProviderLike } from './providers';
import { BalanceMap, EthScanOptions } from './types';
import { batch } from './utils';

/**
 * Get a balance map from an array of addresses and an array of balances.
 *
 * @param {string[]} addresses
 * @param {bigint[]} balances
 * @return {BalanceMap}
 */
export const toBalanceMap = (addresses: string[], balances: Array<bigint>): BalanceMap => {
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
  balances: Array<Array<bigint>>
): BalanceMap<BalanceMap> => {
  return balances.reduce<BalanceMap<BalanceMap>>((current, next, index) => {
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
): Promise<BalanceMap> => {
  const contractAddress = options?.contractAddress ?? CONTRACT_ADDRESS;
  const batchSize = options?.batchSize ?? BATCH_SIZE;

  const result = await batch(
    async (batchedAddresses: string[]) => {
      const data = encodeData(batchedAddresses);

      return decode(['uint256[]'], await call(provider, contractAddress, data))[0];
    },
    batchSize,
    addresses
  );

  return toBalanceMap(addresses, result);
};

export const callMultiple = async (
  provider: ProviderLike,
  addresses: string[],
  otherAddresses: string[],
  encodeData: (addresses: string[], otherAddresses: string[]) => string,
  options?: EthScanOptions
): Promise<BalanceMap<BalanceMap>> => {
  const contractAddress = options?.contractAddress ?? CONTRACT_ADDRESS;
  const batchSize = options?.batchSize ?? BATCH_SIZE;

  const result = await batch(
    async (batchedAddresses: string[]) => {
      const data = encodeData(batchedAddresses, otherAddresses);

      return decode(['uint256[][]'], await call(provider, contractAddress, data))[0] as Array<Array<bigint>>;
    },
    batchSize,
    addresses
  );

  return toNestedBalanceMap(addresses, otherAddresses, result);
};
