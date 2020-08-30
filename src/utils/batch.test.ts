import { BigNumber } from '@ethersproject/bignumber';
import { batch, chunk } from './batch';

describe('chunk', () => {
  const array = ['foo', 'bar', 'baz', 'qux'];

  it('should create chunks of an array', () => {
    const chunked = chunk(array, 2);

    expect(chunked).toHaveLength(2);
    expect(chunked[0][0]).toBe('foo');
    expect(chunked[1][0]).toBe('baz');
  });

  it('should keep uneven items', () => {
    const chunked = chunk(array, 3);

    expect(chunked).toHaveLength(2);
    expect(chunked[0]).toHaveLength(3);
    expect(chunked[1]).toHaveLength(1);
  });
});

describe('batch', () => {
  it('should batch function calls', async () => {
    const handler = jest.fn().mockImplementation(
      async (addresses: string[]): Promise<BigNumber[]> => {
        return addresses.map(() => BigNumber.from(1));
      }
    );

    const balances = await batch(handler, 2, ['0x0', '0x1', '0x2', '0x3']);

    expect(balances).toHaveLength(4);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenNthCalledWith(1, ['0x0', '0x1']);
    expect(handler).toHaveBeenNthCalledWith(2, ['0x2', '0x3']);
  });
});
