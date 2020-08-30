import { BigNumber } from '@ethersproject/bignumber';
import { batch, chunk } from './batch';

describe('chunk', () => {
  const array = ['foo', 'bar', 'baz', 'qux'];

  it('should create chunks of an array', () => {
    const chunked = chunk(array, 2);

    expect(chunked.length).toBe(2);
    expect(chunked[0][0]).toBe('foo');
    expect(chunked[1][0]).toBe('baz');
  });

  it('should keep uneven items', () => {
    const chunked = chunk(array, 3);

    expect(chunked.length).toBe(2);
    expect(chunked[0].length).toBe(3);
    expect(chunked[1].length).toBe(1);
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

    expect(balances.length).toBe(4);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).nthCalledWith(1, ['0x0', '0x1']);
    expect(handler).nthCalledWith(2, ['0x2', '0x3']);
  });
});
