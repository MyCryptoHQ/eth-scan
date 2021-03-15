/**
 * An object that contains the address (key) and balance or balance (value).
 */
export interface BalanceMap<T = bigint> {
  [key: string]: T;
}
