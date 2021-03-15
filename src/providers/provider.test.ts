import { CONTRACT_ADDRESS } from '../constants';
import EIP1193Provider from './eip-1193';
import EthersProvider from './ethers';
import HttpProvider from './http';
import { call } from './provider';
import Web3Provider from './web3';

jest.mock('./eip-1193', () => ({
  isProvider: jest.fn(),
  call: jest.fn().mockImplementation(async () => '0x00')
}));

jest.mock('./ethers', () => ({
  isProvider: jest.fn(),
  call: jest.fn().mockImplementation(async () => '0x00')
}));

jest.mock('./http', () => ({
  isProvider: jest.fn(),
  call: jest.fn().mockImplementation(async () => '0x00')
}));

jest.mock('./web3', () => ({
  isProvider: jest.fn(),
  call: jest.fn().mockImplementation(async () => '0x00')
}));

describe('call', () => {
  it('calls the correct provider', async () => {
    (EIP1193Provider.isProvider as jest.MockedFunction<typeof EIP1193Provider.isProvider>).mockImplementationOnce(
      () => true
    );
    await call('foo', CONTRACT_ADDRESS, '0x');

    (EthersProvider.isProvider as jest.MockedFunction<typeof EthersProvider.isProvider>).mockImplementationOnce(
      () => true
    );
    await call('foo', CONTRACT_ADDRESS, '0x');

    (HttpProvider.isProvider as jest.MockedFunction<typeof HttpProvider.isProvider>).mockImplementationOnce(() => true);
    await call('foo', CONTRACT_ADDRESS, '0x');

    (Web3Provider.isProvider as jest.MockedFunction<typeof Web3Provider.isProvider>).mockImplementationOnce(() => true);
    await call('foo', CONTRACT_ADDRESS, '0x');

    expect(EIP1193Provider.call).toHaveBeenCalledTimes(1);
    expect(EthersProvider.call).toHaveBeenCalledTimes(1);
    expect(HttpProvider.call).toHaveBeenCalledTimes(1);
    expect(Web3Provider.call).toHaveBeenCalledTimes(1);
  });

  it('throws for invalid providers', async () => {
    // @ts-expect-error Invalid provider type
    await expect(() => call({}, CONTRACT_ADDRESS, '0x')).rejects.toThrow('Invalid provider type');
  });
});
