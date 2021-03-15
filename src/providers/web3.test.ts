import { decode, encode, fromHex } from '@findeth/abi';
import { ethers, network, waffle } from 'hardhat';
import { JsonRpcServer } from 'hardhat/internal/hardhat-network/jsonrpc/server';
import Web3 from 'web3';
import { ETHER_BALANCES_ID, ETHER_BALANCES_TYPE, TOKEN_BALANCES_ID, TOKEN_BALANCES_TYPE } from '../constants';
import { fixture } from '../eth-scan.test';
import { withId } from '../utils/abi';
import Web3Provider, { Web3ProviderLike } from './web3';

const { createFixtureLoader, provider } = waffle;
const { isProvider, call } = Web3Provider;

const loadFixture = createFixtureLoader(provider.getWallets(), provider);

const server = new JsonRpcServer({
  hostname: '127.0.0.1',
  port: 8548,
  provider: network.provider
});

beforeAll(async () => {
  await server.listen();
}, 100000);

afterAll(async () => {
  await server.close();
});

const web3 = new Web3('http://127.0.0.1:8548');

describe('isProvider', () => {
  it('checks if a provider is a Web3 provider', () => {
    expect(isProvider(web3)).toBe(true);
    expect(isProvider({})).toBe(false);
  });
});

describe('call', () => {
  it('gets the Ether balances from the contract', async () => {
    const { contract, addresses } = await loadFixture(fixture);

    const data = withId(ETHER_BALANCES_ID, encode(ETHER_BALANCES_TYPE, [addresses]));
    const response = await call((web3 as unknown) as Web3ProviderLike, contract.address, data);

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
    const response = await call((web3 as unknown) as Web3ProviderLike, contract.address, data);

    const decoded = decode(['uint256[]'], fromHex(response))[0];

    for (let i = 0; i < addresses.length; i++) {
      expect(decoded[i]).toBe(1000n);
    }
  });
});
