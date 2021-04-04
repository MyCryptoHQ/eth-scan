import { Result } from '../types';

/**
 * Split an array per `size` items.
 *
 * @param {T[]} input
 * @param {number} size
 * @return {T[][]} An array of arrays of the specified type.
 * @template T
 */
export const chunk = <T>(input: T[], size: number): T[][] => {
  return input.reduce<T[][]>((array, item, index) => {
    return index % size === 0 ? [...array, [item]] : [...array.slice(0, -1), [...array.slice(-1)[0], item]];
  }, []);
};

/**
 * Batch the function calls to `handler` per `size` items.
 *
 * @param {(addresses: string[]) => Promise<T[]>} handler A function that takes a batch of addresses and returns the balance for the addresses.
 * @param {number} size The size of the batches.
 * @param {string[]} addresses The addresses to batch.
 * @return {Promise<T[]>} A promise with the balances.
 * @template T
 */
export const batch = async <T = Result>(
  handler: (addresses: string[]) => Promise<T[]>,
  size: number,
  addresses: string[]
): Promise<T[]> => {
  const chunks = chunk(addresses, size);

  return chunks.reduce<Promise<T[]>>(async (current, next) => {
    return Promise.resolve([...(await current), ...(await handler(next))]);
  }, Promise.resolve<T[]>([]));
};
