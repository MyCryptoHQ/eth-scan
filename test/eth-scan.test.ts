import { expect } from 'chai';
import { getEtherBalances, getTokenBalances, getTokensBalance, getTokensBalances } from '../src';

const BalanceScanner = artifacts.require('BalanceScanner');
const FixedBalanceToken = artifacts.require('FixedBalanceToken');
const InvalidToken = artifacts.require('InvalidToken');

const LOCAL_PROVIDER: string = (web3 as any).currentProvider.host;

describe('eth-scan', () => {
  it('should get Ether balances from the contract', async () => {
    const { address: contractAddress } = await BalanceScanner.deployed();
    const accounts = await web3.eth.getAccounts();
    accounts.shift();

    const balances = await getEtherBalances(LOCAL_PROVIDER, accounts, { contractAddress });

    for (const account of accounts) {
      const balance = BigInt(await web3.eth.getBalance(account));
      expect(balance).to.equal(balances[account]);
    }
  });

  it('should get token balances from the contract', async () => {
    const { address: contractAddress } = await BalanceScanner.deployed();
    const token = await FixedBalanceToken.new();
    const accounts = await web3.eth.getAccounts();
    accounts.shift();

    const balances = await getTokenBalances(LOCAL_PROVIDER, accounts, token.address, {
      contractAddress
    });

    for (const account of accounts) {
      const balance = BigInt(await web3.eth.getBalance(account));
      expect(balance).to.equal(balances[account]);
    }
  });

  it('should get multiple token balances for multiple addresses from the contract', async () => {
    const { address: contractAddress } = await BalanceScanner.deployed();
    const token = await FixedBalanceToken.new();
    const secondToken = await FixedBalanceToken.new();
    const accounts = await web3.eth.getAccounts();
    accounts.shift();

    const balances = await getTokensBalances(
      LOCAL_PROVIDER,
      accounts,
      [token.address, secondToken.address],
      {
        contractAddress
      }
    );

    for (const account of accounts) {
      expect(Object.keys(balances[account]).length).to.equal(2);
      expect(Object.keys(balances[account])[0]).to.equal(token.address);
      expect(Object.keys(balances[account])[1]).to.equal(secondToken.address);
      expect(balances[account][token.address]).to.equal(100000000000000000000n);
      expect(balances[account][secondToken.address]).to.equal(100000000000000000000n);
    }
  });

  it('should get multiple token balances from the contract', async () => {
    const { address: contractAddress } = await BalanceScanner.deployed();
    const token = await FixedBalanceToken.new();
    const secondToken = await FixedBalanceToken.new();
    const accounts = await web3.eth.getAccounts();
    accounts.shift();

    const balances = await getTokensBalance(
      LOCAL_PROVIDER,
      accounts[0],
      [token.address, secondToken.address],
      { contractAddress }
    );

    expect(Object.keys(balances).length).to.equal(2);
    expect(Object.keys(balances)[0]).to.equal(token.address);
    expect(Object.keys(balances)[1]).to.equal(secondToken.address);
    expect(balances[token.address]).to.equal(100000000000000000000n);
    expect(balances[secondToken.address]).to.equal(100000000000000000000n);
  });

  it('should not throw on invalid contracts or non-contract addresses', async () => {
    const { address: contractAddress } = await BalanceScanner.deployed();
    const token = await FixedBalanceToken.new();
    const invalidToken = await InvalidToken.new();
    const accounts = await web3.eth.getAccounts();

    const balances = await getTokensBalance(
      LOCAL_PROVIDER,
      accounts[0],
      [token.address, invalidToken.address, accounts[0]],
      { contractAddress }
    );

    expect(Object.keys(balances).length).to.equal(3);
    expect(balances[token.address]).to.equal(100000000000000000000n);
    expect(balances[invalidToken.address]).to.equal(0n);
    expect(balances[accounts[0]]).to.equal(0n);
  });
});
