import fetch from 'isomorphic-unfetch';
import { stringToBuffer } from '../utils';

interface HttpProviderWithOptions {
  url: string;
  params?: Partial<Omit<RequestInit, 'body' | 'method'>>;
}

export type HttpProviderLike = string | HttpProviderWithOptions;

export interface JsonRpcPayload {
  jsonrpc: string;
  method: string;
  params: any[];
  id?: string | number;
}

export interface JsonRpcResult<T> {
  id: number;
  jsonrpc: string;
  result: T;
  error?: {
    code: number;
    message: string;
    data: string;
  };
}

/**
 * Check if an object is a valid HttpProviderLike object.
 *
 * @param {any} provider
 * @return {boolean}
 */
export const isHttpProvider = (provider: unknown): provider is HttpProviderLike => {
  return (
    typeof provider === 'string' ||
    (typeof provider === 'object' && (provider as HttpProviderWithOptions).url !== undefined)
  );
};

/**
 * Call the contract with the HTTP provider. This throws an error if the call failed.
 *
 * @param {HttpProviderLike} provider
 * @param {string} contractAddress
 * @param {string} data
 * @return {Promise<Buffer>}
 */
export const callWithHttp = async (
  provider: HttpProviderLike,
  contractAddress: string,
  data: string
): Promise<Buffer> => {
  const url = typeof provider === 'string' ? provider : provider.url;
  const options = typeof provider === 'object' ? provider.params : {};

  const payload = getPayload(contractAddress, data);

  const body = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    cache: 'no-cache',
    ...options
  });

  const response: JsonRpcResult<string> = await body.json();

  if (response.error) {
    throw new Error(`Contract call failed: ${response.error.message}`);
  }

  return stringToBuffer(response.result);
};

/**
 * Get the JSON-RPC payload for the `eth_call` function.
 *
 * @param {string} to The address to send the call to, as a hexadecimal string.
 * @param {string} data The data to send to the address, as a hexadecimal string.
 */
export const getPayload = <Data>(to: string, data: Data): JsonRpcPayload => {
  return {
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
  };
};
