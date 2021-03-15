import { encode } from '@findeth/abi';
import { ETHER_BALANCES_ID, ETHER_BALANCES_TYPE } from '../constants';
import { withId } from './abi';

describe('withId', () => {
  it('returns an encoded hexadecimal string', () => {
    expect(
      withId(ETHER_BALANCES_ID, encode(ETHER_BALANCES_TYPE, [['0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520']]))
    ).toBe(
      '0xdbdbb51b000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000004bbeeb066ed09b7aed07bf39eee0460dfa261520'
    );
  });
});
