import { expect } from 'chai';
import EthScan, { HttpProvider } from '../src';

const BalanceScanner = artifacts.require('BalanceScanner');
const FixedBalanceToken = artifacts.require('FixedBalanceToken');

const LOCAL_PROVIDER = web3.currentProvider.host;

describe('EthScan', () => {
  it('should get Ether balances from the contract', async () => {
    const contract = await BalanceScanner.deployed();
    const accounts = await web3.eth.getAccounts();
    accounts.shift();

    const scanner = new EthScan(new HttpProvider(LOCAL_PROVIDER), {
      contractAddress: contract.address
    });

    const balances = await scanner.getEtherBalances(accounts);

    for (const account of accounts) {
      const balance = BigInt(await web3.eth.getBalance(account));
      expect(balance === balances[account]).to.equal(true);
    }
  });

  it('should get token balances from the contract', async () => {
    const contract = await BalanceScanner.deployed();
    const token = await FixedBalanceToken.new();
    const accounts = await web3.eth.getAccounts();
    accounts.shift();

    const scanner = new EthScan(new HttpProvider(LOCAL_PROVIDER), {
      contractAddress: contract.address
    });

    const balances = await scanner.getTokenBalances(token.address, accounts);

    for (const account of accounts) {
      const balance = BigInt(await web3.eth.getBalance(account));
      expect(balance === balances[account]).to.equal(true);
    }
  });
});
