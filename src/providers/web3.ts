import type { JsonRpcPayload, JsonRpcResult, Provider } from '../types';
import { getPayload } from './http';

export interface Web3ProviderLike {
  currentProvider: {
    send<T>(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResult<T>) => void): void;
  };
}

/**
 * Web3 provider, which can be used with an instance of the Web3 class.
 */
const provider: Provider<Web3ProviderLike> = {
  isProvider: (provider: unknown): provider is Web3ProviderLike => {
    return (provider as Web3ProviderLike)?.currentProvider?.send !== undefined;
  },

  call: async (provider: Web3ProviderLike, contractAddress: string, data: string): Promise<string> => {
    const payload = getPayload(contractAddress, data);
    const { result } = await send<string>(provider, payload);

    return result;
  }
};

export default provider;

export const send = <T>(provider: Web3ProviderLike, payload: JsonRpcPayload): Promise<JsonRpcResult<T>> => {
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
