import Provider from './provider';

type BlockTag = string | number;

interface TransactionRequest {
  to: string;
  data: string;
}

export interface EthersProviderLike {
  call(transaction: TransactionRequest, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
}

/**
 * A provider that uses Ethers.js to send calls.
 */
export default class EthersProvider extends Provider {
  /**
   * Create an instance of the EthersProvider class.
   *
   * @param {EthersProviderLike} provider Any supported Ethers.js provider.
   */
  public constructor(public readonly provider: EthersProviderLike) {
    super();
  }

  /**
   * Wrapper function for `eth_call`.
   *
   * @param {string} address The address to send the call to.
   * @param {string} data The data for the transaction.
   * @return {Promise<string>} A Promise with the response data.
   */
  public async call(address: string, data: string): Promise<string> {
    const transaction = {
      to: address,
      data
    };

    try {
      return await this.provider.call(transaction, 'latest');
    } catch (error) {
      throw new Error(`Contract call failed: ${error.message}`);
    }
  }
}
