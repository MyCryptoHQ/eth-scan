import { expect } from 'chai';
import { BigNumber } from '@ethersproject/bignumber';
import { getEtherBalances, getTokenBalances, getTokensBalance } from '../src';

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
      const balance = BigNumber.from(await web3.eth.getBalance(account));
      expect(balance.eq(balances[account])).to.equal(true);
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
      const balance = BigNumber.from(await web3.eth.getBalance(account));
      expect(balance.eq(balances[account])).to.equal(true);
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
    expect(balances[token.address].eq(BigNumber.from('100000000000000000000'))).to.equal(true);
    expect(balances[secondToken.address].eq(BigNumber.from('100000000000000000000'))).to.equal(
      true
    );
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
    expect(balances[token.address].eq(BigNumber.from('100000000000000000000'))).to.equal(true);
    expect(balances[invalidToken.address].eq(BigNumber.from('0'))).to.equal(true);
    expect(balances[accounts[0]].eq(BigNumber.from('0'))).to.equal(true);
  });
});
