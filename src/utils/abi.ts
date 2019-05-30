/**
 * Decode raw data to an array of bigints.
 *
 * @param {Buffer} data The buffer to decode.
 * @return {bigint[]} An array of bigints.
 */
export const decode = (data: Buffer): bigint[] => {
  const balances: bigint[] = [];
  for (let i = 64; i < data.length; i += 32) {
    balances.push(BigInt(bufferToString(data.subarray(i, i + 32))));
  }
  return balances;
};

/**
 * Encode the addresses and an optional token to an input data string.
 *
 * @param {string[]} addresses The addresses formatted as hexadecimal.
 * @param {string} token The address of the token formatted as hexadecimal.
 * @return {string} The input data formatted as hexadecimal.
 */
export const encode = (addresses: string[], token?: string): Buffer => {
  let buffer: Buffer;

  buffer = Buffer.alloc(32);
  buffer.writeInt8(token ? 0x40 : 0x20, 31);

  if (token) {
    const tokenBuffer = Buffer.alloc(32);
    tokenBuffer.write(token.slice(2), 12, 'hex');

    buffer = Buffer.concat([buffer, tokenBuffer]);
  }

  const size = Buffer.alloc(32);
  size.writeInt32BE(addresses.length, 28);

  const addressesBuffer = addresses.reduce<Buffer>((current, next) => {
    const addressBuffer = Buffer.alloc(32);
    addressBuffer.write(next.slice(2), 12, 'hex');

    return Buffer.concat([current, addressBuffer]);
  }, Buffer.alloc(0));

  return Buffer.concat([buffer, size, addressesBuffer]);
};

/**
 * Encode the addresses and an optional token to an input data string with the function identifier.
 *
 * @param {string} id The function identifier as a hexadecimal string.
 * @param {string[]} addresses The addresses as a hexadecimal string.
 * @param {string} token The address of the token as a hexadecimal string.
 * @return {string} The input data as a hexadecimal string.
 */
export const encodeWithId = (id: string, addresses: string[], token?: string): Buffer => {
  return Buffer.concat([Buffer.from(id, 'hex'), encode(addresses, token)]);
};

/**
 * Get the buffer as hexadecimal string, prefixed with 0x.
 *
 * @param {Buffer} buffer The buffer to encode.
 * @return {string} The hexadecimal string.
 */
export const bufferToString = (buffer: Buffer): string => {
  return `0x${buffer.toString('hex')}`;
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
