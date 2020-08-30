import { ETHER_BALANCES_ID, ETHER_BALANCES_TYPE, TOKEN_BALANCES_ID, TOKEN_BALANCES_TYPE } from '../constants';
import { decode, encode, encodeWithId, stringToBuffer } from './abi';

describe('decode', () => {
  it('should decode data', () => {
    const encoded = stringToBuffer(
      '0x' +
        '0000000000000000000000000000000000000000000000000000000000000020' +
        '0000000000000000000000000000000000000000000000000000000000000001' +
        '0000000000000000000000000000000000000000000000056bc75e2d63100000'
    );

    const decoded = decode<[Array<bigint>]>(['uint256[]'], encoded)[0];
    expect(decoded).toHaveLength(1);
    expect(decoded[0]).toBe(100000000000000000000n);
  });
});

describe('encode', () => {
  it('should encode addresses', () => {
    const encoded = encode(ETHER_BALANCES_TYPE, ['0xf00f00f00f00f00f00f00f00f00f00f00f00f00f']);

    expect(encoded).toBe(
      '0x' +
        '0000000000000000000000000000000000000000000000000000000000000020' +
        '0000000000000000000000000000000000000000000000000000000000000001' +
        '000000000000000000000000f00f00f00f00f00f00f00f00f00f00f00f00f00f'
    );
  });

  it('should encode addresses with a token specified', () => {
    const encoded = encode(
      TOKEN_BALANCES_TYPE,
      ['0xf00f00f00f00f00f00f00f00f00f00f00f00f00f'],
      '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'
    );

    expect(encoded).toBe(
      '0x' +
        '0000000000000000000000000000000000000000000000000000000000000040' +
        '00000000000000000000000089d24a6b4ccb1b6faa2625fe562bdd9a23260359' +
        '0000000000000000000000000000000000000000000000000000000000000001' +
        '000000000000000000000000f00f00f00f00f00f00f00f00f00f00f00f00f00f'
    );
  });
});

describe('encodeWithId', () => {
  it('should encode addresses with a function identifier', () => {
    const encoded = encodeWithId(ETHER_BALANCES_ID, ETHER_BALANCES_TYPE, [
      '0xf00f00f00f00f00f00f00f00f00f00f00f00f00f'
    ]);

    expect(encoded).toBe(
      '0x' +
        ETHER_BALANCES_ID +
        '0000000000000000000000000000000000000000000000000000000000000020' +
        '0000000000000000000000000000000000000000000000000000000000000001' +
        '000000000000000000000000f00f00f00f00f00f00f00f00f00f00f00f00f00f'
    );
  });

  it('should encode addresses with a function identifier and a token specified', () => {
    const encoded = encodeWithId(
      TOKEN_BALANCES_ID,
      TOKEN_BALANCES_TYPE,
      ['0xf00f00f00f00f00f00f00f00f00f00f00f00f00f'],
      '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'
    );

    expect(encoded).toBe(
      '0x' +
        TOKEN_BALANCES_ID +
        '0000000000000000000000000000000000000000000000000000000000000040' +
        '00000000000000000000000089d24a6b4ccb1b6faa2625fe562bdd9a23260359' +
        '0000000000000000000000000000000000000000000000000000000000000001' +
        '000000000000000000000000f00f00f00f00f00f00f00f00f00f00f00f00f00f'
    );
  });
});
