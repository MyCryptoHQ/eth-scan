import { HttpProviderLike } from './http';
import { stringToBuffer } from '../utils';

type BlockTag = string | number;

interface TransactionRequest {
  to: string;
  data: string;
}

export interface EthersProviderLike {
  call(transaction: TransactionRequest, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
}

/**
 * Check if an object is a valid EthersProviderLike object.
 *
 * @param {any} provider
 * @return {boolean}
 */
export const isEthersProvider = (provider: unknown): provider is EthersProviderLike => {
  return (provider as EthersProviderLike)?.call !== undefined;
};

/**
 * Call the contract with an Ethers provider. This throws an error if the call failed.
 *
 * @param {HttpProviderLike} provider
 * @param {string} contractAddress
 * @param {string} data
 * @return {Promise<Buffer>}
 */
export const callWithEthers = async (
  provider: EthersProviderLike,
  contractAddress: string,
  data: string
): Promise<Buffer> => {
  const transaction: TransactionRequest = {
    to: contractAddress,
    data
  };

  try {
    return stringToBuffer(await provider.call(transaction, 'latest'));
  } catch (error) {
    throw new Error(`Contract call failed: ${error.message ?? error.toString()}`);
  }
};
