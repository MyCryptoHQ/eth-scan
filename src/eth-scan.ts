import { encode } from '@findeth/abi';
import { callSingle, toBalanceMap, toNestedBalanceMap } from './api';
import {
  BALANCE_OF_ID,
  BALANCE_OF_TYPE,
  ETHER_BALANCES_ID,
  ETHER_BALANCES_TYPE,
  TOKEN_BALANCES_ID,
  TOKEN_BALANCES_TYPE,
  TOKENS_BALANCE_ID,
  TOKENS_BALANCE_TYPE
} from './constants';
import { ProviderLike } from './providers';
import type { BalanceMap, EthScanOptions } from './types';
import { withId } from './utils';

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
  const results = await callSingle(
    provider,
    addresses,
    [],
    [],
    (batch) => withId(ETHER_BALANCES_ID, encode(ETHER_BALANCES_TYPE, [batch])),
    () => '',
    options
  );

  return toBalanceMap(addresses, results);
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
  const results = await callSingle(
    provider,
    addresses,
    addresses,
    tokenAddress,
    (batch) => withId(TOKEN_BALANCES_ID, encode(TOKEN_BALANCES_TYPE, [batch, tokenAddress])),
    (address) => withId(BALANCE_OF_ID, encode(BALANCE_OF_TYPE, [address])),
    options
  );

  return toBalanceMap(addresses, results);
};

/**
 * Get the ERC-20 token balances for multiple contracts, for multiple addresses.
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
  const balances = await Promise.all(
    addresses.map(async (address) => Object.values(await getTokensBalance(provider, address, tokenAddresses, options)))
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
  const results = await callSingle(
    provider,
    tokenAddresses,
    address,
    tokenAddresses,
    (batch) => withId(TOKENS_BALANCE_ID, encode(TOKENS_BALANCE_TYPE, [address, batch])),
    () => withId(BALANCE_OF_ID, encode(BALANCE_OF_TYPE, [address])),
    options
  );

  return toBalanceMap(tokenAddresses, results);
};
