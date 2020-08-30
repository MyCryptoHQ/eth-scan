import { Signer } from 'ethers';
import { MockContract, MockProvider } from 'ethereum-waffle';
import BalanceScannerArtifact from '../artifacts/BalanceScanner.json';
import { BalanceScanner } from './contracts/BalanceScanner';
import { abi } from '../artifacts/ERC20.json';
import { Erc20 } from './contracts/Erc20';
import { waffle, ethers } from '@nomiclabs/buidler';
import { getEtherBalances, getTokenBalances, getTokensBalance, getTokensBalances } from './eth-scan';

const { deployContract, deployMockContract, loadFixture } = waffle;

export const fixture = async (signers: Signer[], provider: MockProvider) => {
  const signer = signers[0];
  const contract = (await deployContract(signer, BalanceScannerArtifact)) as BalanceScanner;
  const token = (await deployMockContract(signer, abi)) as MockContract & Erc20;

  const addresses = await Promise.all(signers.slice(1).map(s => s.getAddress()));

  return { contract, signers, addresses, provider, token };
};

describe('eth-scan', () => {
  describe('getEtherBalances', () => {
    it('returns the ether balances for multiple addresses as a BalanceMap', async () => {
      const { contract, addresses } = await loadFixture(fixture);

      const balances = await getEtherBalances(ethers.provider, addresses, { contractAddress: contract.address });
      for (const address of addresses) {
        const balance = BigInt((await ethers.provider.getBalance(address)).toHexString());
        expect(balance).toBe(balances[address]);
      }
    });
  });

  describe('getTokenBalances', () => {
    it('returns the token balances of one token, for multiple addresses', async () => {
      const { contract, addresses, token } = await loadFixture(fixture);
      await token.mock.balanceOf.returns('1000');

      const balances = await getTokenBalances(ethers.provider, addresses, token.address, {
        contractAddress: contract.address
      });
      for (const address of addresses) {
        expect(balances[address]).toBe(1000n);
      }
    });

    it('does not throw for invalid contracts', async () => {
      const { contract, addresses, token } = await loadFixture(fixture);

      await expect(() =>
        getTokenBalances(ethers.provider, addresses, token.address, { contractAddress: contract.address })
      ).not.toThrow();
    });
  });

  describe('getTokensBalances', () => {
    it('returns multiple token balances, for multiple addresses', async () => {
      const { contract, signers, addresses } = await loadFixture(fixture);
      const tokenA = (await deployMockContract(signers[0], abi)) as MockContract & Erc20;
      await tokenA.mock.balanceOf.returns('1000');

      const tokenB = (await deployMockContract(signers[0], abi)) as MockContract & Erc20;
      await tokenB.mock.balanceOf.returns('1');

      const balances = await getTokensBalances(ethers.provider, addresses, [tokenA.address, tokenB.address], {
        contractAddress: contract.address
      });
      for (const address of addresses) {
        expect(Object.keys(balances[address]).length).toBe(2);
        expect(Object.keys(balances[address])[0]).toBe(tokenA.address);
        expect(Object.keys(balances[address])[1]).toBe(tokenB.address);
        expect(balances[address][tokenA.address]).toBe(1000n);
        expect(balances[address][tokenB.address]).toBe(1n);
      }
    });

    it('does not throw for invalid contracts', async () => {
      const { contract, signers, addresses } = await loadFixture(fixture);
      const tokenA = (await deployMockContract(signers[0], abi)) as MockContract & Erc20;
      const tokenB = (await deployMockContract(signers[0], abi)) as MockContract & Erc20;

      await expect(() =>
        getTokensBalances(ethers.provider, addresses, [tokenA.address, tokenB.address], {
          contractAddress: contract.address
        })
      ).not.toThrow();
    });
  });

  describe('getTokensBalance', () => {
    it('returns multiple token balances for a single address', async () => {
      const { contract, signers, addresses } = await loadFixture(fixture);
      const tokenA = (await deployMockContract(signers[0], abi)) as MockContract & Erc20;
      await tokenA.mock.balanceOf.returns('1000');

      const tokenB = (await deployMockContract(signers[0], abi)) as MockContract & Erc20;
      await tokenB.mock.balanceOf.returns('1');

      const balances = await getTokensBalance(ethers.provider, addresses[0], [tokenA.address, tokenB.address], {
        contractAddress: contract.address
      });
      expect(Object.keys(balances).length).toBe(2);
      expect(Object.keys(balances)[0]).toBe(tokenA.address);
      expect(Object.keys(balances)[1]).toBe(tokenB.address);
      expect(balances[tokenA.address]).toBe(1000n);
      expect(balances[tokenB.address]).toBe(1n);
    });

    it('does not throw for invalid contracts', async () => {
      const { contract, signers, addresses } = await loadFixture(fixture);
      const tokenA = (await deployMockContract(signers[0], abi)) as MockContract & Erc20;
      const tokenB = (await deployMockContract(signers[0], abi)) as MockContract & Erc20;

      await expect(() =>
        getTokensBalance(ethers.provider, addresses[0], [tokenA.address, tokenB.address], {
          contractAddress: contract.address
        })
      ).not.toThrow();
    });
  });
});
