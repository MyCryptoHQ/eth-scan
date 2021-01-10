import { ethers, waffle } from 'hardhat';
import { ETHER_BALANCES_ID, ETHER_BALANCES_TYPE, TOKEN_BALANCES_ID, TOKEN_BALANCES_TYPE } from '../constants';
import { fixture } from '../eth-scan.test';
import { decode, encodeWithId } from '../utils';
import { callWithHttp, isHttpProvider } from './http';

jest.mock('isomorphic-unfetch');

const { createFixtureLoader, provider } = waffle;

const loadFixture = createFixtureLoader(provider.getWallets(), provider);

describe('isHttpProvider', () => {
  it('checks if a provider is an HTTP provider', () => {
    expect(isHttpProvider('https://foo')).toBe(true);
    expect(
      isHttpProvider({
        url: 'https://foo'
      })
    ).toBe(true);
    expect(isHttpProvider({})).toBe(false);
  });
});

describe('callWithHttp', () => {
  it('gets the Ether balances from the contract', async () => {
    const { contract, addresses } = await loadFixture(fixture);

    const data = encodeWithId(ETHER_BALANCES_ID, ETHER_BALANCES_TYPE, addresses);
    const response = await callWithHttp(ethers.provider.connection.url, contract.address, data);

    const decoded = decode<[Array<bigint>]>(['uint256[]'], response)[0];

    for (let i = 0; i < addresses.length; i++) {
      const balance = BigInt((await ethers.provider.getBalance(addresses[i])).toHexString());
      expect(balance).toBe(decoded[i]);
    }
  });

  it('gets the token balances from the contract', async () => {
    const { contract, addresses, token } = await loadFixture(fixture);
    await token.mock.balanceOf.returns('1000');

    const data = encodeWithId(TOKEN_BALANCES_ID, TOKEN_BALANCES_TYPE, addresses, token.address);
    const response = await callWithHttp(ethers.provider.connection.url, contract.address, data);

    const decoded = decode<[Array<bigint>]>(['uint256[]'], response)[0];

    for (let i = 0; i < addresses.length; i++) {
      expect(decoded[i]).toBe(1000n);
    }
  });
});
