import fetch from 'isomorphic-unfetch';
import type { EthCallJsonRpcPayload, JsonRpcResult, Provider } from '../types';

interface HttpProviderOptions {
  url: string;
  params?: Partial<Omit<RequestInit, 'body' | 'method' | 'headers'>>;
}

export type HttpProviderLike = string | HttpProviderOptions;

/**
 * A raw HTTP provider, which can be used with an Ethereum node endpoint (JSON-RPC), or an `HttpProviderOptions` object.
 */
const provider: Provider<HttpProviderLike> = {
  isProvider: (provider: unknown): provider is HttpProviderLike => {
    return (
      typeof provider === 'string' ||
      (typeof provider === 'object' && (provider as HttpProviderOptions).url !== undefined)
    );
  },

  call: async (provider: HttpProviderLike, contractAddress: string, data: string): Promise<string> => {
    const url = typeof provider === 'string' ? provider : provider.url;
    const options = typeof provider === 'object' ? provider.params : {};
    const payload = getPayload(contractAddress, data);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      cache: 'no-cache',
      ...options
    });

    if (!response.ok) {
      throw new Error(`Contract call failed with HTTP error ${response.status}: ${response.statusText}`);
    }

    const { error, result }: JsonRpcResult<string> = await response.json();
    if (error) {
      throw new Error(`Contract call failed: ${error.message}`);
    }

    return result;
  }
};

export default provider;

/**
 * Get the JSON-RPC payload for the `eth_call` function.
 */
export const getPayload = (to: string, data: string): EthCallJsonRpcPayload => ({
  jsonrpc: '2.0',
  method: 'eth_call',
  params: [
    {
      to,
      data
    },
    'latest'
  ],
  id: 1
});
