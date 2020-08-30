import { waffle, ethers } from '@nomiclabs/buidler';
import { fixture } from '../eth-scan.test';
import { decode, encodeWithId } from '../utils';
import { ETHER_BALANCES_ID, ETHER_BALANCES_TYPE, TOKEN_BALANCES_ID, TOKEN_BALANCES_TYPE } from '../constants';
import { BigNumber } from '@ethersproject/bignumber';
import { callWithWeb3, isWeb3Provider, Web3ProviderLike } from './web3';
import Web3 from 'web3';

jest.mock('web3');

const { deployContract, deployMockContract, loadFixture } = waffle;

describe('isWeb3Provider', () => {
  it('checks if a provider is an HTTP provider', () => {
    expect(
      isWeb3Provider({
        currentProvider: {
          send(): void {
            /* noop */
          }
        }
      })
    ).toBe(true);
    expect(isWeb3Provider({})).toBe(false);
  });
});

describe('callWithWeb3', () => {
  const web3 = new Web3(ethers.provider.connection.url);

  it('gets the Ether balances from the contract', async () => {
    const { contract, addresses } = await loadFixture(fixture);

    const data = encodeWithId(ETHER_BALANCES_ID, ETHER_BALANCES_TYPE, addresses);
    const response = await callWithWeb3((web3 as unknown) as Web3ProviderLike, contract.address, data);

    const decoded = decode<[BigNumber[]]>(['uint256[]'], response)[0];

    for (let i = 0; i < addresses.length; i++) {
      const balance = BigInt((await ethers.provider.getBalance(addresses[i])).toHexString());
      expect(balance).toBe(decoded[i]);
    }
  });

  it('gets the token balances from the contract', async () => {
    const { contract, addresses, token } = await loadFixture(fixture);
    await token.mock.balanceOf.returns('1000');

    const data = encodeWithId(TOKEN_BALANCES_ID, TOKEN_BALANCES_TYPE, addresses, token.address);
    const response = await callWithWeb3((web3 as unknown) as Web3ProviderLike, contract.address, data);

    const decoded = decode<[BigNumber[]]>(['uint256[]'], response)[0];

    for (let i = 0; i < addresses.length; i++) {
      expect(decoded[i]).toBe(1000n);
    }
  });
});
