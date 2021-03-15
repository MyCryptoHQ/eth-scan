import { fromHex } from '@findeth/abi';
import type { Provider, ProviderType } from '../types';
import EIP1193Provider from './eip-1193';
import EthersProvider from './ethers';
import HttpProvider from './http';
import Web3Provider from './web3';

const providers = [EIP1193Provider, EthersProvider, HttpProvider, Web3Provider] as const;

export type ProviderLike = ProviderType<typeof providers>;

/**
 * Send a call with the data, using the specified provider. If the provider is not a valid provider type (e.g. not a
 * Ethers.js provider, URL or Web3 provider), this will throw an error.
 *
 * @param {ProviderLike} providerLike
 * @param {string} contractAddress
 * @param {string} data
 * @return {Promise<Uint8Array>}
 */
export const call = async (providerLike: ProviderLike, contractAddress: string, data: string): Promise<Uint8Array> => {
  const provider: Provider<unknown> | undefined = providers.find((type) => type.isProvider(providerLike));
  if (!provider) {
    throw new Error('Invalid provider type');
  }

  try {
    const result = await provider.call(providerLike, contractAddress, data);
    return fromHex(result);
  } catch (error) {
    throw new Error(`Failed to get data from eth-scan contract: ${error.stack ?? error.toString()}`);
  }
};
