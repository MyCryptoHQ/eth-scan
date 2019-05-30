export default abstract class Provider {
  /**
   * Wrapper function for `eth_call`.
   *
   * @param {string} address The address to send the call to.
   * @param {string} data The data for the transaction.
   */
  public abstract call(address: string, data: string): Promise<string>;
}
