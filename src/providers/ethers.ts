import type { Provider } from '../types';

type BlockTag = string | number;

interface TransactionRequest {
  to: string;
  data: string;
}

export interface EthersProviderLike {
  call(transaction: TransactionRequest, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
}

/**
 * Ethers.js provider, which can be used with an instance of the Ethers.js Provider class.
 */
const provider: Provider<EthersProviderLike> = {
  isProvider: (provider: unknown): provider is EthersProviderLike => {
    return (provider as EthersProviderLike)?.call !== undefined;
  },

  call: async (provider: EthersProviderLike, contractAddress: string, data: string): Promise<string> => {
    const transaction: TransactionRequest = {
      to: contractAddress,
      data
    };

    return provider.call(transaction, 'latest');
  }
};

export default provider;
