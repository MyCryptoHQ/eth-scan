import ERC20Artifact from '@openzeppelin/contracts/build/contracts/IERC20.json';
import { MockContract, MockProvider } from 'ethereum-waffle';
import { Signer } from 'ethers';
import { waffle, ethers } from 'hardhat';
import BalanceScannerArtifact from '../artifacts/contracts/BalanceScanner.sol/BalanceScanner.json';
import ERC20InvalidMockArtifact from '../artifacts/contracts/mocks/ERC20InvalidMock.sol/ERC20InvalidMock.json';
import { BalanceScanner, ERC20InvalidMock } from './contracts';
import { getEtherBalances, getTokenBalances, getTokensBalance, getTokensBalances } from './eth-scan';

const { deployContract, deployMockContract, createFixtureLoader, provider } = waffle;

const loadFixture = createFixtureLoader(provider.getWallets(), provider);

// eslint-disable-next-line jest/no-export
export const fixture = async (
  signers: Signer[],
  provider: MockProvider
): Promise<{
  contract: BalanceScanner;
  signers: Signer[];
  addresses: string[];
  provider: MockProvider;
  token: MockContract;
  tokenA: MockContract;
  tokenB: MockContract;
  invalidToken: ERC20InvalidMock;
}> => {
  const signer = signers[0];
  const contract = (await deployContract(signer, BalanceScannerArtifact)) as BalanceScanner;
  const token = await deployMockContract(signer, ERC20Artifact.abi);

  const tokenA = (await deployMockContract(signers[0], ERC20Artifact.abi)) as MockContract;
  await tokenA.mock.balanceOf.returns('1000');

  const tokenB = (await deployMockContract(signers[0], ERC20Artifact.abi)) as MockContract;
  await tokenB.mock.balanceOf.returns('1');

  const addresses = await Promise.all(signers.slice(1).map((s) => s.getAddress()));

  const invalidToken = (await deployContract(signer, ERC20InvalidMockArtifact, [
    addresses[0],
    1000
  ])) as ERC20InvalidMock;

  return { contract, signers, addresses, provider, token, tokenA, tokenB, invalidToken };
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

    it('retries failed contract calls', async () => {
      const { contract, addresses, invalidToken } = await loadFixture(fixture);

      const balances = await getTokenBalances(ethers.provider, [addresses[0], addresses[1]], invalidToken.address, {
        contractAddress: contract.address
      });

      expect(balances[addresses[0]]).toBe(1000n);
      expect(balances[addresses[1]]).toBe(0n);
    });
  });

  describe('getTokensBalances', () => {
    it('returns multiple token balances, for multiple addresses', async () => {
      const { contract, signers, addresses, tokenA, tokenB } = await loadFixture(fixture);

      const balances = await getTokensBalances(ethers.provider, addresses, [tokenA.address, tokenB.address], {
        contractAddress: contract.address
      });
      for (const address of addresses) {
        expect(Object.keys(balances[address])).toHaveLength(2);
        expect(Object.keys(balances[address])[0]).toBe(tokenA.address);
        expect(Object.keys(balances[address])[1]).toBe(tokenB.address);
        expect(balances[address][tokenA.address]).toBe(1000n);
        expect(balances[address][tokenB.address]).toBe(1n);
      }
    });

    it('does not throw for invalid contracts', async () => {
      const { contract, signers, addresses } = await loadFixture(fixture);
      const tokenA = (await deployMockContract(signers[0], ERC20Artifact.abi)) as MockContract;
      const tokenB = (await deployMockContract(signers[0], ERC20Artifact.abi)) as MockContract;

      await expect(() =>
        getTokensBalances(ethers.provider, addresses, [tokenA.address, tokenB.address], {
          contractAddress: contract.address
        })
      ).not.toThrow();
    });

    it('retries failed contract calls', async () => {
      const { contract, addresses, token, tokenA, invalidToken } = await loadFixture(fixture);

      const balances = await getTokensBalances(
        ethers.provider,
        [addresses[0], addresses[1]],
        [tokenA.address, invalidToken.address, token.address],
        {
          contractAddress: contract.address
        }
      );

      expect(balances[addresses[0]][token.address]).toBe(0n);
      expect(balances[addresses[0]][tokenA.address]).toBe(1000n);
      expect(balances[addresses[0]][invalidToken.address]).toBe(1000n);
      expect(balances[addresses[1]][token.address]).toBe(0n);
      expect(balances[addresses[1]][tokenA.address]).toBe(1000n);
      expect(balances[addresses[1]][invalidToken.address]).toBe(0n);
    });
  });

  describe('getTokensBalance', () => {
    it('returns multiple token balances for a single address', async () => {
      const { contract, addresses, tokenA, tokenB } = await loadFixture(fixture);

      const balances = await getTokensBalance(ethers.provider, addresses[0], [tokenA.address, tokenB.address], {
        contractAddress: contract.address
      });
      expect(Object.keys(balances)).toHaveLength(2);
      expect(Object.keys(balances)[0]).toBe(tokenA.address);
      expect(Object.keys(balances)[1]).toBe(tokenB.address);
      expect(balances[tokenA.address]).toBe(1000n);
      expect(balances[tokenB.address]).toBe(1n);
    });

    it('does not throw for invalid contracts', async () => {
      const { contract, signers, addresses } = await loadFixture(fixture);
      const tokenA = (await deployMockContract(signers[0], ERC20Artifact.abi)) as MockContract;
      const tokenB = (await deployMockContract(signers[0], ERC20Artifact.abi)) as MockContract;

      await expect(() =>
        getTokensBalance(ethers.provider, addresses[0], [tokenA.address, tokenB.address], {
          contractAddress: contract.address
        })
      ).not.toThrow();
    });

    it('retries failed contract calls', async () => {
      const { contract, addresses, token, tokenA, invalidToken } = await loadFixture(fixture);

      const balances = await getTokensBalance(
        ethers.provider,
        addresses[0],
        [token.address, tokenA.address, invalidToken.address],
        {
          contractAddress: contract.address
        }
      );

      expect(balances[token.address]).toBe(0n);
      expect(balances[tokenA.address]).toBe(1000n);
      expect(balances[invalidToken.address]).toBe(1000n);
    });
  });
});
