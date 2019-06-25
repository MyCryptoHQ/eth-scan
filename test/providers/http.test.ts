import { expect } from 'chai';
import { getPayload } from '../../src/providers/http';
import { HttpProvider } from '../../src/providers';
import { bufferToString, decode, encodeWithId, stringToBuffer } from '../../src/utils';
import {
  ETHER_BALANCES_ID,
  ETHER_BALANCES_TYPE,
  TOKEN_BALANCES_ID,
  TOKEN_BALANCES_TYPE
} from '../../src/constants';
import BigNumber from 'bignumber.js';

const BalanceScanner = artifacts.require('BalanceScanner');
const FixedBalanceToken = artifacts.require('FixedBalanceToken');

const LOCAL_PROVIDER = web3.currentProvider.host;

describe('providers/http', () => {
  describe('getPayload()', () => {
    it('should return the request body as JSON string', async () => {
      const contract = await BalanceScanner.deployed();

      const json = getPayload(contract.address, '0x');
      expect(() => JSON.parse(json)).to.not.throw();

      const body = JSON.parse(json);
      expect(body.method).to.equal('eth_call');
      expect(body.params[0].to).to.equal(contract.address);
      expect(body.params[0].data).to.equal('0x');
    });
  });

  describe('HttpProvider', async () => {
    const provider = new HttpProvider(LOCAL_PROVIDER);

    it('should get Ether balances from the contract', async () => {
      const contract = await BalanceScanner.deployed();
      const accounts = await web3.eth.getAccounts();
      accounts.shift();

      const data = encodeWithId(ETHER_BALANCES_ID, ETHER_BALANCES_TYPE, accounts);
      const response = await provider.call(contract.address, data);

      const decoded = decode(stringToBuffer(response));

      for (let i = 0; i < accounts.length; i++) {
        const balance = new BigNumber(await web3.eth.getBalance(accounts[i]));
        expect(balance.isEqualTo(decoded[i])).to.equal(true);
      }
    });

    it('should get token balances from the contract', async () => {
      const contract = await BalanceScanner.deployed();
      const token = await FixedBalanceToken.new();
      const accounts = await web3.eth.getAccounts();

      const data = encodeWithId(TOKEN_BALANCES_ID, TOKEN_BALANCES_TYPE, accounts, token.address);
      const response = await provider.call(contract.address, data);

      const decoded = decode(stringToBuffer(response));

      for (let i = 0; i < accounts.length; i++) {
        expect(decoded[i].isEqualTo(new BigNumber('100000000000000000000'))).to.equal(true);
      }
    });
  });
});
