import { stringToBuffer } from '../utils';
import { getPayload, JsonRpcPayload, JsonRpcResult } from './http';

export interface Web3ProviderLike {
  currentProvider: {
    send<T>(
      payload: JsonRpcPayload,
      callback: (error: Error | null, result?: JsonRpcResult<T>) => void
    ): void;
  };
}

/**
 * Check if an object is a valid Web3ProviderLike object.
 *
 * @param {any} provider
 * @return {boolean}
 */
export const isWeb3Provider = (provider: unknown): provider is Web3ProviderLike => {
  return (provider as Web3ProviderLike)?.currentProvider?.send !== undefined;
};

/**
 * Call the contract with a Web3 provider. This throws an error if the call failed.
 *
 * @param {Web3ProviderLike} provider
 * @param {string} contractAddress
 * @param {string} data
 * @return {Promise<Buffer>}
 */
export const callWithWeb3 = async (
  provider: Web3ProviderLike,
  contractAddress: string,
  data: string
): Promise<Buffer> => {
  const payload = getPayload(contractAddress, data);

  try {
    const response = await send<string>(provider, payload);

    return stringToBuffer(response.result);
  } catch (error) {
    throw new Error(`Contract call failed: ${error.message}`);
  }
};

export const send = <T>(
  provider: Web3ProviderLike,
  payload: JsonRpcPayload
): Promise<JsonRpcResult<T>> => {
  return new Promise((resolve, reject) => {
    provider.currentProvider.send<T>(payload, (error, result) => {
      if (error) {
        return reject(error);
      }

      if (!result) {
        return reject(new Error('No response payload'));
      }

      resolve(result);
    });
  });
};
