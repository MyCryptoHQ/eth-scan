import { decode, toNumber } from '@findeth/abi';
import { BATCH_SIZE, CONTRACT_ADDRESS } from './constants';
import { call, ProviderLike } from './providers';
import { BalanceMap, EthScanOptions, Result } from './types';
import { batch } from './utils';

const isResult = (result: unknown): result is Result => {
  return Array.isArray(result) && result.length === 2;
};

/**
 * Get a balance map from an array of addresses and an array of balances.
 *
 * @param {string[]} addresses
 * @param {bigint[]} results
 * @return {BalanceMap}
 */
export const toBalanceMap = (addresses: string[], results: Array<bigint | Result>): BalanceMap => {
  return results.reduce<BalanceMap>((current, next, index) => {
    const value = isResult(next) ? toNumber(next[1].slice(0, 32)) : next;

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
 * Low level API function to send a contract call that returns a single Result array. It will automatically retry any
 * failed calls.
 *
 * @param provider
 * @param batchAddresses The addresses to batch by
 * @param addresses The address(es) to use when retrying failed calls
 * @param contractAddresses The contract address(es) to use when retrying failed calls
 * @param encodeData
 * @param encodeSingle
 * @param options
 */
export const callSingle = async (
  provider: ProviderLike,
  batchAddresses: string[],
  addresses: string | string[],
  contractAddresses: string | string[],
  encodeData: (addresses: string[]) => string,
  encodeSingle: (address: string) => string,
  options?: EthScanOptions
): Promise<Result[]> => {
  const contractAddress = options?.contractAddress ?? CONTRACT_ADDRESS;
  const batchSize = options?.batchSize ?? BATCH_SIZE;

  const results = await batch(
    async (batchedAddresses: string[]) => {
      const data = encodeData(batchedAddresses);
      const buffer = await call(provider, contractAddress, data);

      return decode(['(bool,bytes)[]'], buffer)[0] as Result[];
    },
    batchSize,
    batchAddresses
  );

  return retryCalls(provider, addresses, contractAddresses, results, encodeSingle);
};

/**
 * Retry calls to the contract directly, if a contract call in the eth-scan contract failed.
 *
 * @param provider
 * @param addresses
 * @param contracts
 * @param results
 * @param encodeData
 */
export const retryCalls = async (
  provider: ProviderLike,
  addresses: string | string[],
  contracts: string | string[],
  results: Result[],
  encodeData: (address: string) => string
): Promise<Result[]> => {
  return Promise.all(
    results.map(async (result, index) => {
      if (result[0]) {
        return result;
      }

      const address = typeof addresses === 'string' ? addresses : addresses[index];
      const contractAddress = typeof contracts === 'string' ? contracts : contracts[index];
      const data = encodeData(address);

      try {
        const newResult = await call(provider, contractAddress, data);
        return [true, newResult] as [boolean, Uint8Array];
      } catch {
        // noop
      }

      return result;
    })
  );
};
