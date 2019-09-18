import { Provider } from './providers';
import { batch, decode, encodeWithId, stringToBuffer } from './utils';
import {
  CONTRACT_ADDRESS,
  ETHER_BALANCES_ID,
  ETHER_BALANCES_TYPE,
  TOKEN_BALANCES_ID,
  TOKEN_BALANCES_TYPE,
  TOKENS_BALANCE_ID,
  TOKENS_BALANCE_TYPE
} from './constants';
import BigNumber from 'bignumber.js';

/**
 * An object that contains the address (key) and balance (value).
 */
export interface BalanceMap {
  [key: string]: BigNumber;
}

export interface EthScanOptions {
  /**
   * The address of the contract to use. Defaults to 0xbb4AAaF8cAA1A575B43E7673e5b155C1c5A8BC13.
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
    const balances = await batch(
      (batchedAddresses: string[]) => {
        const data = encodeWithId(ETHER_BALANCES_ID, ETHER_BALANCES_TYPE, batchedAddresses);

        return this.call(data);
      },
      this.options.batchSize || 1000,
      addresses
    );

    return this.getBalances(addresses, balances);
  }

  /**
   * Get the ERC-20 token balances of the token with the address `tokenAddress` for the addresses
   * specified.
   *
   * @param {string[]} addresses The addresses to get the balances for.
   * @param {string} tokenAddress The token contract to get the balances from.
   * @return {Promise<BalanceMap>} A Promise with the balances as BalanceMap.
   */
  public async getTokenBalances(addresses: string[], tokenAddress: string): Promise<BalanceMap> {
    const balances = await batch(
      (batchedAddresses: string[]) => {
        const data = encodeWithId(
          TOKEN_BALANCES_ID,
          TOKEN_BALANCES_TYPE,
          batchedAddresses,
          tokenAddress
        );

        return this.call(data);
      },
      this.options.batchSize || 1000,
      addresses
    );

    return this.getBalances(addresses, balances);
  }

  /**
   * Get the ERC-20 token balance of the tokens with the addresses `tokenAddresses` for the single
   * address specified.
   * @param {string} address The address to get the balance for.
   * @param {string[]} tokenAddresses The token contracts to get the balance from.
   * @return {Promise<BalanceMap>} A Promise with the balances as BalanceMap.
   */
  public async getTokensBalance(address: string, tokenAddresses: string[]): Promise<BalanceMap> {
    const balances = await batch(
      (batchedAddresses: string[]) => {
        const data = encodeWithId(
          TOKENS_BALANCE_ID,
          TOKENS_BALANCE_TYPE,
          address,
          batchedAddresses
        );

        return this.call(data);
      },
      this.options.batchSize || 1000,
      tokenAddresses
    );

    return this.getBalances(tokenAddresses, balances);
  }

  private getBalances(addresses: string[], balances: BigNumber[]): BalanceMap {
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
   * @param {string} data The hexadecimal input data to send.
   * @return {Promise<BigNumber[]>} A Promise with an array of BigNumbers.
   */
  private async call(data: string): Promise<BigNumber[]> {
    const response = await this.provider.call(
      this.options.contractAddress || CONTRACT_ADDRESS,
      data
    );

    return decode(stringToBuffer(response));
  }
}
