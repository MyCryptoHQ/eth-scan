import { decode, encode, fromHex } from '@findeth/abi';
import { ethers, waffle } from 'hardhat';
import { ETHER_BALANCES_ID, ETHER_BALANCES_TYPE, TOKEN_BALANCES_ID, TOKEN_BALANCES_TYPE } from '../constants';
import { fixture } from '../eth-scan.test';
import { withId } from '../utils/abi';
import EthersProvider from './ethers';

const { createFixtureLoader, provider } = waffle;
const { isProvider, call } = EthersProvider;

const loadFixture = createFixtureLoader(provider.getWallets(), provider);

describe('isProvider', () => {
  it('checks if a provider is an Ethers.js provider', () => {
    expect(isProvider(ethers.provider)).toBe(true);
    expect(isProvider({})).toBe(false);
  });
});

describe('call', () => {
  it('gets the Ether balances from the contract', async () => {
    const { contract, addresses } = await loadFixture(fixture);

    const data = withId(ETHER_BALANCES_ID, encode(ETHER_BALANCES_TYPE, [addresses]));
    const response = await call(ethers.provider, contract.address, data);

    const decoded = decode(['uint256[]'], fromHex(response))[0];

    for (let i = 0; i < addresses.length; i++) {
      const balance = BigInt((await ethers.provider.getBalance(addresses[i])).toHexString());
      expect(balance).toBe(decoded[i]);
    }
  });

  it('gets the token balances from the contract', async () => {
    const { contract, addresses, token } = await loadFixture(fixture);
    await token.mock.balanceOf.returns('1000');

    const data = withId(TOKEN_BALANCES_ID, encode(TOKEN_BALANCES_TYPE, [addresses, token.address]));
    const response = await call(ethers.provider, contract.address, data);

    const decoded = decode(['uint256[]'], fromHex(response))[0];

    for (let i = 0; i < addresses.length; i++) {
      expect(decoded[i]).toBe(1000n);
    }
  });
});
