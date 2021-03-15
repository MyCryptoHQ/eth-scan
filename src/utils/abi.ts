import { toHex } from '@findeth/abi';

/**
 * Add 0x-prefix and ABI identifier to an encoded buffer.
 *
 * @param {string} id
 * @param {Uint8Array} data
 * @return {string}
 */
export const withId = (id: string, data: Uint8Array): string => `0x${id}${toHex(data)}`;
