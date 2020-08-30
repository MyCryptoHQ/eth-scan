import { waffle, ethers } from '@nomiclabs/buidler';
import { callWithEthers, isEthersProvider } from './ethers';
import { fixture } from '../eth-scan.test';
import { decode, encodeWithId } from '../utils';
import { ETHER_BALANCES_ID, ETHER_BALANCES_TYPE, TOKEN_BALANCES_ID, TOKEN_BALANCES_TYPE } from '../constants';
import { BigNumber } from '@ethersproject/bignumber';

const { deployContract, deployMockContract, loadFixture } = waffle;

describe('isEthersProvider', () => {
  it('checks if a provider is an Ethers.js provider', () => {
    expect(isEthersProvider(ethers.provider)).toBe(true);
    expect(isEthersProvider({})).toBe(false);
  });
});

describe('callWithEthers', () => {
  it('gets the Ether balances from the contract', async () => {
    const { contract, addresses } = await loadFixture(fixture);

    const data = encodeWithId(ETHER_BALANCES_ID, ETHER_BALANCES_TYPE, addresses);
    const response = await callWithEthers(ethers.provider, contract.address, data);

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
    const response = await callWithEthers(ethers.provider, contract.address, data);

    const decoded = decode<[BigNumber[]]>(['uint256[]'], response)[0];

    for (let i = 0; i < addresses.length; i++) {
      expect(decoded[i]).toBe(1000n);
    }
  });
});
