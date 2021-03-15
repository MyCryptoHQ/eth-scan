import { decode, encode, fromHex } from '@findeth/abi';
import { EthereumProvider } from 'eip1193-provider';
import { network, ethers, waffle } from 'hardhat';
import { JsonRpcServer } from 'hardhat/internal/hardhat-network/jsonrpc/server';
import { ETHER_BALANCES_ID, ETHER_BALANCES_TYPE, TOKEN_BALANCES_ID, TOKEN_BALANCES_TYPE } from '../constants';
import { fixture } from '../eth-scan.test';
import { withId } from '../utils/abi';
import EIP1193Provider from './eip-1193';

const { createFixtureLoader, provider } = waffle;
const { isProvider, call } = EIP1193Provider;

const loadFixture = createFixtureLoader(provider.getWallets(), provider);

const server = new JsonRpcServer({
  hostname: '127.0.0.1',
  port: 8546,
  provider: network.provider
});

const ethereumProvider = new EthereumProvider('http://127.0.0.1:8546');

beforeAll(async () => {
  await server.listen();
}, 100000);

afterAll(async () => {
  await server.close();
});

describe('isProvider', () => {
  it('checks if a provider is an EIP-1193 provider', () => {
    expect(isProvider(ethereumProvider)).toBe(true);
    expect(isProvider({})).toBe(false);
  });
});

describe('call', () => {
  it('gets the Ether balances from the contract', async () => {
    const { contract, addresses } = await loadFixture(fixture);

    const data = withId(ETHER_BALANCES_ID, encode(ETHER_BALANCES_TYPE, [addresses]));
    const response = await call(ethereumProvider, contract.address, data);

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
    const response = await call(ethereumProvider, contract.address, data);

    const decoded = decode(['uint256[]'], fromHex(response))[0];

    for (let i = 0; i < addresses.length; i++) {
      expect(decoded[i]).toBe(1000n);
    }
  });
});
