import { expect } from 'chai';
import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { callWithEthers } from '../../src';
import { decode, encodeWithId } from '../../src/utils';
import {
  ETHER_BALANCES_ID,
  ETHER_BALANCES_TYPE,
  TOKEN_BALANCES_ID,
  TOKEN_BALANCES_TYPE
} from '../../src/constants';

const BalanceScanner = artifacts.require('BalanceScanner');
const FixedBalanceToken = artifacts.require('FixedBalanceToken');

const LOCAL_PROVIDER: string = (web3 as any).currentProvider.host;

describe('providers/ethers', () => {
  describe('callWithEthers()', async () => {
    const provider = new JsonRpcProvider(LOCAL_PROVIDER);

    it('should get Ether balances from the contract', async () => {
      const { address } = await BalanceScanner.deployed();
      const accounts = await web3.eth.getAccounts();
      accounts.shift();

      const data = encodeWithId(ETHER_BALANCES_ID, ETHER_BALANCES_TYPE, accounts);
      const response = await callWithEthers(provider, address, data);

      const decoded = decode<[BigNumber[]]>(['uint256[]'], response)[0];

      for (let i = 0; i < accounts.length; i++) {
        const balance = BigInt(await web3.eth.getBalance(accounts[i]));
        expect(balance).to.equal(decoded[i]);
      }
    });

    it('should get token balances from the contract', async () => {
      const { address } = await BalanceScanner.deployed();
      const token = await FixedBalanceToken.new();
      const accounts = await web3.eth.getAccounts();

      const data = encodeWithId(TOKEN_BALANCES_ID, TOKEN_BALANCES_TYPE, accounts, token.address);
      const response = await callWithEthers(provider, address, data);

      const decoded = decode<[BigNumber[]]>(['uint256[]'], response)[0];

      for (let i = 0; i < accounts.length; i++) {
        expect(decoded[i]).to.equal(100000000000000000000n);
      }
    });
  });
});
