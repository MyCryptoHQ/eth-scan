import { callWithEthers, EthersProviderLike, isEthersProvider } from './ethers';
import { callWithHttp, HttpProviderLike, isHttpProvider } from './http';
import { callWithWeb3, isWeb3Provider, Web3ProviderLike } from './web3';
import { callWithShepherd, isShepherdProvider, ShepherdProviderLike } from './shepherd';

export type ProviderLike =
  | HttpProviderLike
  | EthersProviderLike
  | ShepherdProviderLike
  | Web3ProviderLike;

/**
 * Send a call with the data, using the specified provider. If the provider is not a valid provider type (e.g. not a
 * Ethers.js provider, URL or Web3 provider), this will throw an error.
 *
 * @param {ProviderLike} provider
 * @param {string} contractAddress
 * @param {string} data
 * @return {Promise<Buffer>}
 */
export const call = async (
  provider: ProviderLike,
  contractAddress: string,
  data: string
): Promise<Buffer> => {
  if (isEthersProvider(provider)) {
    return callWithEthers(provider, contractAddress, data);
  }

  if (isHttpProvider(provider)) {
    return callWithHttp(provider, contractAddress, data);
  }

  if (isShepherdProvider(provider)) {
    return callWithShepherd(provider, contractAddress, data);
  }

  if (isWeb3Provider(provider)) {
    return callWithWeb3(provider, contractAddress, data);
  }

  throw new Error('Invalid provider specified');
};
