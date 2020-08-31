import { waffle } from '@nomiclabs/buidler';
import { BigNumber } from 'ethers';
import ERC20Mock from 'openzeppelin-solidity/build/contracts/ERC20Mock.json';
import BalanceScannerArtifact from '../artifacts/BalanceScanner.json';
import { BalanceScanner } from '../src/contracts/BalanceScanner';

const { deployContract } = waffle;

interface GasResults {
  baseCost: number;
  minimum: number;
  average: number;
  maximum: number;
}

interface Results {
  addresses: number;
  etherBalances: GasResults;
  tokenBalances: GasResults;
  tokensBalance: GasResults;
}

const toNumber = (n: BigNumber): number => n.toNumber();

const estimateGas = async (): Promise<Results> => {
  const wallets = await waffle.provider.getWallets();
  const contract = (await deployContract(wallets[0], BalanceScannerArtifact)) as BalanceScanner;

  // 100 empty addresses
  const addresses = new Array(100).fill(undefined).map(() => waffle.provider.createEmptyWallet().address);

  const getResults = (estimations: number[]): GasResults => {
    const increments = estimations
      .slice(1)
      .map((estimate, index, array) => (index > 0 ? estimate - array[index - 1] : estimate));

    return {
      baseCost: estimations[0],
      minimum: Math.min(...increments),
      average: Math.round(increments.reduce<number>((a, b) => a + b, 0) / increments.length),
      maximum: Math.max(...increments)
    };
  };

  /**
   * Estimate gas usage for `etherBalances(address[])`.
   */
  const estimateGetEtherBalancesGas = async (): Promise<GasResults> => {
    const estimations = await addresses.reduce<Promise<number[]>>(async (array, _, index) => {
      const previous = await array;
      const current = toNumber(await contract.estimateGas.etherBalances(addresses.slice(0, index))) - 21000;

      return [...previous, current];
    }, Promise.resolve([]));

    return getResults(estimations);
  };

  /**
   * Estimate gas usage for `tokenBalances(address[], token)`.
   */
  const estimateGetTokenBalancesGas = async (): Promise<GasResults> => {
    // Deploys token contract and assigns balance to address
    const token = await deployContract(wallets[0], ERC20Mock, ['Test Token', 'TEST', wallets[0].address, '100']);

    const estimations = await addresses.reduce<Promise<number[]>>(async (array, _, index) => {
      const previous = await array;
      const current =
        toNumber(await contract.estimateGas.tokenBalances(addresses.slice(0, index), token.address)) - 21000;

      return [...previous, current];
    }, Promise.resolve([]));

    return getResults(estimations);
  };

  /**
   * Estimate gas usage for `tokensBalance(address, tokens[])`.
   */
  const estimateGetTokensBalanceGas = async (): Promise<GasResults> => {
    // Deploys token contract and assigns balance to address
    const token = await deployContract(wallets[0], ERC20Mock, ['Test Token', 'TEST', wallets[0].address, '100']);

    const estimations = await addresses.reduce<Promise<number[]>>(async (array, _, index) => {
      const previous = await array;
      const current =
        toNumber(await contract.estimateGas.tokensBalance(addresses[0], new Array(index).fill(token.address))) - 21000;

      return [...previous, current];
    }, Promise.resolve([]));

    return getResults(estimations);
  };

  return {
    addresses: addresses.length,
    etherBalances: await estimateGetEtherBalancesGas(),
    tokenBalances: await estimateGetTokenBalancesGas(),
    tokensBalance: await estimateGetTokensBalanceGas()
  };
};

estimateGas()
  /* eslint-disable no-console */
  .then(console.log)
  .catch(console.error);
