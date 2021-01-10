import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-solhint';
import 'hardhat-typechain';

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  solidity: {
    version: '0.7.2',
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000
      }
    }
  },
  typechain: {
    outDir: 'src/contracts',
    target: 'ethers-v5'
  }
};

export default config;
