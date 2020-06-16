import { expect } from 'chai';
import { BigNumber } from '@ethersproject/bignumber';
import { callWithWeb3, Web3ProviderLike } from '../../src';
import { decode, encodeWithId } from '../../src/utils';
import {
  ETHER_BALANCES_ID,
  ETHER_BALANCES_TYPE,
  TOKEN_BALANCES_ID,
  TOKEN_BALANCES_TYPE
} from '../../src/constants';

const BalanceScanner = artifacts.require('BalanceScanner');
const FixedBalanceToken = artifacts.require('FixedBalanceToken');

describe('providers/web3', () => {
  describe('Web3Provider', async () => {
    it('should get Ether balances from the contract', async () => {
      const { address } = await BalanceScanner.deployed();
      const accounts = await web3.eth.getAccounts();
      accounts.shift();

      const data = encodeWithId(ETHER_BALANCES_ID, ETHER_BALANCES_TYPE.inputs, accounts);
      const response = await callWithWeb3((web3 as unknown) as Web3ProviderLike, address, data);

      const decoded = decode<[BigNumber[]]>(ETHER_BALANCES_TYPE.outputs, response)[0];

      for (let i = 0; i < accounts.length; i++) {
        const balance = BigInt(await web3.eth.getBalance(accounts[i]));
        expect(balance).to.equal(decoded[i]);
      }
    });

    it('should get token balances from the contract', async () => {
      const { address } = await BalanceScanner.deployed();
      const token = await FixedBalanceToken.new();
      const accounts = await web3.eth.getAccounts();

      const data = encodeWithId(
        TOKEN_BALANCES_ID,
        TOKEN_BALANCES_TYPE.inputs,
        accounts,
        token.address
      );
      const response = await callWithWeb3((web3 as unknown) as Web3ProviderLike, address, data);

      const decoded = decode<[BigNumber[]]>(TOKEN_BALANCES_TYPE.outputs, response)[0];

      for (let i = 0; i < accounts.length; i++) {
        expect(decoded[i]).to.equal(100000000000000000000n);
      }
    });
  });
});
