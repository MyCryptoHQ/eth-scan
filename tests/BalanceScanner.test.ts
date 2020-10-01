import { waffle } from '@nomiclabs/buidler';
import { MockContract, MockProvider } from 'ethereum-waffle';
import { BigNumber, Signer } from 'ethers';
import IERC20Artifact from 'openzeppelin-solidity/build/contracts/IERC20.json';
import BalanceScannerArtifact from '../artifacts/BalanceScanner.json';
import { BalanceScanner } from '../src/contracts/BalanceScanner';

const { deployContract, deployMockContract, loadFixture } = waffle;

/**
 * Low-level tests for the contract itself, using direct contract interactions. For the library itself, you can refer
 * to `src/eth-scan.test.ts`.
 */
describe('BalanceScanner', () => {
  const fixture = async (signers: Signer[], provider: MockProvider) => {
    const signer = signers[0];
    const contract = (await deployContract(signer, BalanceScannerArtifact)) as BalanceScanner;
    const token = (await deployMockContract(signer, IERC20Artifact.abi)) as MockContract;

    return { contract, signers, provider, token };
  };

  describe('etherBalances', () => {
    it('returns ether balances for addresses', async () => {
      const { contract, signers } = await loadFixture(fixture);

      const addresses = await Promise.all(signers.slice(1).map((signer) => signer.getAddress()));
      const balances = await Promise.all(signers.slice(1).map((signer) => signer.getBalance()));

      await expect(contract.etherBalances(addresses)).resolves.toStrictEqual(balances);
    });

    it('returns an empty array when no addresses passed', async () => {
      const { contract } = await loadFixture(fixture);

      await expect(contract.etherBalances([])).resolves.toStrictEqual([]);
    });
  });

  describe('tokenBalances', () => {
    it('returns the token balances for addresses', async () => {
      const { contract, signers, token } = await loadFixture(fixture);

      await token.mock.balanceOf.returns('1000');

      const addresses = await Promise.all(signers.slice(1).map((signer) => signer.getAddress()));
      const balances = await Promise.all(signers.slice(1).map((signer) => signer.getAddress().then(token.balanceOf)));

      await expect(contract.tokenBalances(addresses, token.address)).resolves.toStrictEqual(balances);
    });

    it('returns an empty array when no addresses passed', async () => {
      const { contract, token } = await loadFixture(fixture);

      await expect(contract.tokenBalances([], token.address)).resolves.toStrictEqual([]);
    });

    it('does not fail when a token is invalid', async () => {
      const { contract, signers, token } = await loadFixture(fixture);
      const address = await signers[0].getAddress();

      await expect(contract.tokenBalances([address], token.address)).resolves.toStrictEqual([BigNumber.from('0')]);
    });
  });

  describe('tokensBalances', () => {
    it('returns the balance for multiple tokens, for multiple addresses', async () => {
      const { contract, signers } = await loadFixture(fixture);
      const tokenA = (await deployMockContract(signers[0], IERC20Artifact.abi)) as MockContract;
      await tokenA.mock.balanceOf.returns('1000');

      const tokenB = (await deployMockContract(signers[0], IERC20Artifact.abi)) as MockContract;
      await tokenB.mock.balanceOf.returns('1');

      const addresses = await Promise.all(signers.map((signer) => signer.getAddress()));
      const balances = signers.map(() => [BigNumber.from('1000'), BigNumber.from('1')]);

      await expect(contract.tokensBalances(addresses, [tokenA.address, tokenB.address])).resolves.toStrictEqual(
        balances
      );
    });

    it('returns an empty array when no addresses passed', async () => {
      const { contract, signers, token } = await loadFixture(fixture);
      const address = await signers[0].getAddress();

      await expect(contract.tokensBalances([], [token.address])).resolves.toStrictEqual([]);
      await expect(contract.tokensBalances([address], [])).resolves.toStrictEqual([[]]);
    });

    it('does not fail when a token is invalid', async () => {
      const { contract, signers } = await loadFixture(fixture);
      const tokenA = (await deployMockContract(signers[0], IERC20Artifact.abi)) as MockContract;
      await tokenA.mock.balanceOf.returns('1000');

      const tokenB = (await deployMockContract(signers[0], IERC20Artifact.abi)) as MockContract;

      const addresses = await Promise.all(signers.map((signer) => signer.getAddress()));
      const balances = signers.map(() => [BigNumber.from('1000'), BigNumber.from('0')]);

      await expect(contract.tokensBalances(addresses, [tokenA.address, tokenB.address])).resolves.toStrictEqual(
        balances
      );
    });
  });

  describe('tokensBalance', () => {
    it('returns the token balance for multiple tokens, for a single address', async () => {
      const { contract, signers } = await loadFixture(fixture);
      const address = await signers[0].getAddress();

      const tokenA = (await deployMockContract(signers[0], IERC20Artifact.abi)) as MockContract;
      await tokenA.mock.balanceOf.returns('1000');

      const tokenB = (await deployMockContract(signers[0], IERC20Artifact.abi)) as MockContract;
      await tokenB.mock.balanceOf.returns('1');

      await expect(contract.tokensBalance(address, [tokenA.address, tokenB.address])).resolves.toStrictEqual([
        BigNumber.from('1000'),
        BigNumber.from('1')
      ]);
    });

    it('returns an empty array when no addresses passed', async () => {
      const { contract, signers } = await loadFixture(fixture);
      const address = await signers[0].getAddress();

      await expect(contract.tokensBalance(address, [])).resolves.toStrictEqual([]);
    });

    it('does not fail when a token is invalid', async () => {
      const { contract, signers } = await loadFixture(fixture);
      const address = await signers[0].getAddress();

      const tokenA = (await deployMockContract(signers[0], IERC20Artifact.abi)) as MockContract;
      await tokenA.mock.balanceOf.returns('1000');

      const tokenB = (await deployMockContract(signers[0], IERC20Artifact.abi)) as MockContract;

      await expect(contract.tokensBalance(address, [tokenA.address, tokenB.address])).resolves.toStrictEqual([
        BigNumber.from('1000'),
        BigNumber.from('0')
      ]);
    });
  });
});
