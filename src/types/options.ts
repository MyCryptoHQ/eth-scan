export interface EthScanOptions {
  /**
   * The address of the contract to use. Defaults to 0xbb4AAaF8cAA1A575B43E7673e5b155C1c5A8BC13.
   */
  contractAddress?: string;

  /**
   * It's not possible to check thousands of addresses at the same time, due to gas limitations.
   * Calls are split per `batchSize` addresses, by default set to 1000.
   */
  batchSize?: number;
}
