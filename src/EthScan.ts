import { Provider } from './providers';
import { batch, bufferToString, decode, encodeWithId, stringToBuffer } from './utils';
import { CONTRACT_ADDRESS, ETHER_BALANCES_ID, TOKEN_BALANCES_ID } from './constants';

/**
 * An object that contains the address (key) and balance (value). The balance is a native bigint.
 */
export interface BalanceMap {
  [key: string]: bigint;
}

export interface EthScanOptions {
  /**
   * The address of the contract to use. Defaults to 0x82Ea2E7834Bb0D6224dd6fd7125d44b83d6D6809.
   */
  contractAddress: string;

  /**
   * It's not possible to check thousands of addresses at the same time, due to gas limitations.
   * Calls are split per `batchSize` addresses, by default set to 1000.
   */
  batchSize: number;
}

export default class EthScan {
  /**
   * Create a new instance of the EthScan class.
   *
   * @param {Provider} provider The provider to use.
   * @param {EthScanOptions} options Optional options to use.
   */
  public constructor(
    public readonly provider: Provider,
    public readonly options: Partial<EthScanOptions> = {}
  ) {
    this.call = this.call.bind(this);
  }

  /**
   * Get the Ether balances for the addresses specified.
   *
   * @param {string[]} addresses The addresses to get the balances for.
   * @return {Promise<BalanceMap>} A Promise with the balances as BalanceMap.
   */
  public async getEtherBalances(addresses: string[]): Promise<BalanceMap> {
    return this.getBalances(ETHER_BALANCES_ID, addresses);
  }

  /**
   * Get the ERC-20 token balances of the token with the address `tokenAddress` for the addresses
   * specified.
   *
   * @param {string} tokenAddress The token contract to get the balances from.
   * @param {string[]} addresses The addresses to get the balances for.
   * @return {Promise<BalanceMap>} A Promise with the balances as BalanceMap.
   */
  public async getTokenBalances(tokenAddress: string, addresses: string[]): Promise<BalanceMap> {
    return this.getBalances(TOKEN_BALANCES_ID, addresses, tokenAddress);
  }

  /**
   * Get Ether or token balances as a BalanceMap.
   *
   * @param {string} functionId The function identifier.
   * @param {string[]} addresses An array of the addresses to get the balance for.
   * @param {string} tokenAddress The optional token address to get the balance for.
   * @return {Promise<BalanceMap>} A Promise with the balances as BalanceMap.
   */
  private async getBalances(
    functionId: string,
    addresses: string[],
    tokenAddress?: string
  ): Promise<BalanceMap> {
    const balances = await batch(
      this.call,
      this.options.batchSize || 1000,
      addresses,
      functionId,
      tokenAddress
    );

    return balances.reduce<BalanceMap>((current, next, index) => {
      return {
        ...current,
        [addresses[index]]: next
      };
    }, {});
  }

  /**
   * Use the provider to call the contract.
   *
   * @param {string[]} addresses An array of the addresses to get the balance for.
   * @param functionId The function identifier.
   * @param tokenAddress The optional token address to get the balance for.
   * @return {Promise<bigint[]>} A Promise with an array of bigints.
   */
  private async call(
    addresses: string[],
    functionId: string,
    tokenAddress?: string
  ): Promise<bigint[]> {
    const data = encodeWithId(functionId, addresses, tokenAddress);

    const response = await this.provider.call(
      this.options.contractAddress || CONTRACT_ADDRESS,
      bufferToString(data)
    );
    return decode(stringToBuffer(response));
  }
}
