import chai from 'chai';
import spies from 'chai-spies';
import { batch, chunk } from '../../src/utils';
import { ETHER_BALANCES_ID } from '../../src/constants';

chai.use(spies);

const expect = chai.expect;

describe('utils/batch', () => {
  describe('chunk()', () => {
    const array = ['foo', 'bar', 'baz', 'qux'];

    it('should create chunks of an array', () => {
      const chunked = chunk(array, 2);

      expect(chunked.length).to.equal(2);
      expect(chunked[0][0]).to.equal('foo');
      expect(chunked[1][0]).to.equal('baz');
    });

    it('should keep uneven items', () => {
      const chunked = chunk(array, 3);

      expect(chunked.length).to.equal(2);
      expect(chunked[0].length).to.equal(3);
      expect(chunked[1].length).to.equal(1);
    });
  });

  describe('batch()', () => {
    const handler = async (addresses: string[]): Promise<bigint[]> => {
      return addresses.map(() => 1n);
    };

    it('should batch function calls', async () => {
      const spy = chai.spy(handler);
      const balances = await batch(spy, 2, ['0x0', '0x1', '0x2', '0x3']);

      expect(balances.length).to.equal(4);
      expect(spy).to.have.been.called.exactly(2);
      expect(spy)
        .on.nth(1)
        .to.have.been.called.with(['0x0', '0x1']);
      expect(spy)
        .on.nth(2)
        .to.have.been.called.with(['0x2', '0x3']);
    });
  });
});
