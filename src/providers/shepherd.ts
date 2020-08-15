import { HttpProviderLike } from './http';
import { stringToBuffer } from '../utils';

export interface ShepherdCallOptions {
  to: string;
  data: string;
}

export interface ShepherdProviderLike {
  sendCallRequest(options: ShepherdCallOptions): Promise<string>;
}

/**
 * Check if an object is a valid EthersProviderLike object.
 *
 * @param {any} provider
 * @return {boolean}
 */
export const isShepherdProvider = (provider: unknown): provider is ShepherdProviderLike => {
  return (provider as ShepherdProviderLike)?.sendCallRequest !== undefined;
};

/**
 * Call the contract with an Ethers provider. This throws an error if the call failed.
 *
 * @param {HttpProviderLike} provider
 * @param {string} contractAddress
 * @param {string} data
 * @return {Promise<Buffer>}
 */
export const callWithShepherd = async (
  provider: ShepherdProviderLike,
  contractAddress: string,
  data: string
): Promise<Buffer> => {
  const transaction: ShepherdCallOptions = {
    to: contractAddress,
    data
  };

  try {
    return stringToBuffer(await provider.sendCallRequest(transaction));
  } catch (error) {
    throw new Error(`Contract call failed: ${error.message ?? error.toString()}`);
  }
};
