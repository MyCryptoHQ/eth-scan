import { defaultAbiCoder } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';

const HEXADECIMAL_CHARACTERS = '0123456789abcdef';

/**
 * Decode raw data to an array of BigNumbers.
 *
 * @param {Buffer} data The buffer to decode.
 * @return {BigNumber[]} An array of BigNumbers.
 */
/*export const decode = (data: Buffer): BigNumber[] => {
  const balances: BigNumber[] = [];
  for (let i = 64; i < data.length; i += 32) {
    balances.push(BigNumber.from(bufferToString(data.subarray(i, i + 32))));
  }
  return balances;
};*/

/**
 * Encode the addresses and an optional token to an input data string.
 *
 * @param {string[]} types An array of types.
 * @param {...any[]} args The arguments as defined by the types.
 * @return {string} The input data formatted as hexadecimal string.
 */
export const encode = (types: string[], ...args: any[]): string => {
  return defaultAbiCoder.encode(types, [...args]);
};

/**
 * Decode data from a raw Buffer.
 *
 * @param {string[]} types An array of types.
 * @param {Buffer} data The Buffer to decode.
 * @return {T} The decoded data.
 * @template T
 */
export const decode = <T>(types: string[], data: Buffer): T => {
  return defaultAbiCoder.decode(types, data);
};

/**
 * Encode the addresses and an optional token to an input data string with the function identifier.
 *
 * @param {string} id The function identifier as a hexadecimal string.
 * @param {string[]} types An array of types.
 * @param {...any[]} args The arguments as defined by the types.
 * @return {string} The input data as a hexadecimal string.
 */
export const encodeWithId = (id: string, types: string[], ...args: any[]): string => {
  return `0x${id}${encode(types, ...args).slice(2)}`;
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
