import type { JsonRpcPayload, Provider } from '../types';
import { getPayload } from './http';

export interface EIP1193ProviderLike {
  request(transaction: JsonRpcPayload): Promise<string>;
}

/**
 * EIP-1193 provider, which can be used with the `window.ethereum` object.
 */
const provider: Provider<EIP1193ProviderLike> = {
  isProvider: (provider: unknown): provider is EIP1193ProviderLike => {
    return (provider as EIP1193ProviderLike)?.request !== undefined;
  },

  call: async (provider: EIP1193ProviderLike, contractAddress: string, data: string): Promise<string> => {
    const payload = getPayload(contractAddress, data);
    return provider.request(payload);
  }
};

export default provider;
