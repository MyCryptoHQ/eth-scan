import { expect } from 'chai';
import EthScan, { HttpProvider } from '../src';
import BigNumber from 'bignumber.js';

const BalanceScanner = artifacts.require('BalanceScanner');
const FixedBalanceToken = artifacts.require('FixedBalanceToken');
const InvalidToken = artifacts.require('InvalidToken');

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
      const balance = new BigNumber(await web3.eth.getBalance(account));
      expect(balance.isEqualTo(balances[account])).to.equal(true);
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

    const balances = await scanner.getTokenBalances(accounts, token.address);

    for (const account of accounts) {
      const balance = new BigNumber(await web3.eth.getBalance(account));
      expect(balance.isEqualTo(balances[account])).to.equal(true);
    }
  });

  it('should get multiple token balances from the contract', async () => {
    const contract = await BalanceScanner.deployed();
    const token = await FixedBalanceToken.new();
    const secondToken = await FixedBalanceToken.new();
    const accounts = await web3.eth.getAccounts();
    accounts.shift();

    const scanner = new EthScan(new HttpProvider(LOCAL_PROVIDER), {
      contractAddress: contract.address
    });

    const balances = await scanner.getTokensBalance(accounts[0], [
      token.address,
      secondToken.address
    ]);

    expect(Object.keys(balances).length).to.equal(2);
    expect(Object.keys(balances)[0]).to.equal(token.address);
    expect(Object.keys(balances)[1]).to.equal(secondToken.address);
    expect(balances[token.address].isEqualTo(new BigNumber('100000000000000000000'))).to.equal(
      true
    );
    expect(
      balances[secondToken.address].isEqualTo(new BigNumber('100000000000000000000'))
    ).to.equal(true);
  });

  it('should not throw on invalid contracts or non-contract addresses', async () => {
    const contract = await BalanceScanner.deployed();
    const token = await FixedBalanceToken.new();
    const invalidToken = await InvalidToken.new();
    const accounts = await web3.eth.getAccounts();

    const scanner = new EthScan(new HttpProvider(LOCAL_PROVIDER), {
      contractAddress: contract.address
    });

    const balances = await scanner.getTokensBalance(accounts[0], [
      token.address,
      invalidToken.address,
      accounts[0]
    ]);

    expect(Object.keys(balances).length).to.equal(3);
    expect(balances[token.address].isEqualTo(new BigNumber('100000000000000000000'))).to.equal(
      true
    );
    expect(balances[invalidToken.address].isEqualTo(new BigNumber('0'))).to.equal(true);
    expect(balances[accounts[0]].isEqualTo(new BigNumber('0'))).to.equal(true);
  });
});
