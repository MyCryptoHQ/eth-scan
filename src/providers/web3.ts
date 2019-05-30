import Provider from './provider';

interface Web3ProviderLike {
  send(method: string, parameters: any[]): Promise<any>;
}

export interface Web3Like {
  currentProvider: Web3ProviderLike;
}

/**
 * A provider that uses Web3.js to send calls.
 */
export default class Web3Provider extends Provider {
  /**
   * Create an instance of the Web3Provider class.
   *
   * @param {Web3Like} web3 An instance of the Web3 class.
   */
  public constructor(public readonly web3: Web3Like) {
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
    return await this.web3.currentProvider.send('eth_call', [
      {
        to: address,
        data
      },
      'latest'
    ]);
  }
}
