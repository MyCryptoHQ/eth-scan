import { BuidlerConfig, usePlugin } from '@nomiclabs/buidler/config';

usePlugin('@nomiclabs/buidler-ethers');
usePlugin('@nomiclabs/buidler-waffle');

const config: BuidlerConfig = {
  networks: {
    goerli: {
      url: 'https://goerli.infura.io/v3/1a5d06ff3d3941798d62cea6f1c28fcf',
      accounts: {
        mnemonic: process.env.MNEMONIC_PHRASE || ''
      }
    }
  },
  solc: {
    version: '0.7.2',
    optimizer: {
      enabled: true,
      runs: 2000
    }
  }
};

export default config;
