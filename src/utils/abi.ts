import { decode as decodeAbi, encode as encodeAbi } from '@findeth/abi';

const HEXADECIMAL_CHARACTERS = '0123456789abcdef';

/**
 * Encode the addresses and an optional token to an input data string.
 *
 * @param {string[]} inputs An array of inputs.
 * @param {...any[]} data The arguments as defined by the types.
 * @return {string} The input data formatted as hexadecimal string.
 */
export const encode = (inputs: string[], ...data: unknown[]): string => {
  return bufferToString(encodeAbi(inputs, data));
};

/**
 * Decode data from a raw Buffer.
 *
 * @param {string[]} inputs An array of inputs.
 * @param {Buffer} data The Buffer to decode.
 * @return {T} The decoded data.
 * @template T
 */
export const decode = <T extends unknown[]>(inputs: string[], data: Buffer): T => {
  return decodeAbi(inputs, data);
};

/**
 * Encode the addresses and an optional token to an input data string with the function identifier.
 *
 * @param {string} id The function identifier as a hexadecimal string.
 * @param {string[]} types An array of inputs.
 * @param {...any[]} data The arguments as defined by the types.
 * @return {string} The input data as a hexadecimal string.
 */
export const encodeWithId = (id: string, types: string[], ...data: unknown[]): string => {
  return `0x${id}${encode(types, ...data).slice(2)}`;
};

/**
 * Get the buffer as hexadecimal string, prefixed with 0x.
 *
 * @param {Buffer} buffer The buffer to encode.
 * @return {string} The hexadecimal string.
 */
export const bufferToString = (buffer: Buffer): string => {
  return new Uint8Array(buffer).reduce<string>((current, next) => {
    return current + HEXADECIMAL_CHARACTERS[next >> 4] + HEXADECIMAL_CHARACTERS[next & 15];
  }, '0x');
};

/**
 * Get a buffer from a hexadecimal string.
 *
 * @param {string} data The hexadecimal string including the 0x prefix.
 * @return {Buffer} A Buffer of the hexadecimal string.
 */
export const stringToBuffer = (data: string): Buffer => {
  return Buffer.from(data.slice(2), 'hex');
};
