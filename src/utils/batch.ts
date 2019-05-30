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
    return index % size === 0
      ? [...array, [item]]
      : [...array.slice(0, -1), [...array.slice(-1)[0], item]];
  }, []);
};

/**
 * Batch the function calls to `handler` per `size` items.
 *
 * @param {Function} handler A function that takes an address, function ID and optional token
 *   address, and returns the balances.
 * @param {number} size The size of the batches.
 * @param {string[]} addresses The addresses to batch.
 * @param {string} functionId The function ID.
 * @param {string} tokenAddress The optional token address.
 */
export const batch = async (
  handler: (addresses: string[], functionId: string, tokenAddress?: string) => Promise<bigint[]>,
  size: number,
  addresses: string[],
  functionId: string,
  tokenAddress?: string
): Promise<bigint[]> => {
  const chunks = chunk(addresses, size);

  return chunks.reduce<Promise<bigint[]>>(async (current, next) => {
    return Promise.resolve([
      ...(await current),
      ...(await handler(next, functionId, tokenAddress))
    ]);
  }, Promise.resolve([]));
};
