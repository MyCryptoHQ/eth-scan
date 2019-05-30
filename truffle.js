const { register } = require('ts-node');
register({ files: true });

const HDWalletProvider = require('truffle-hdwallet-provider');

const MNEMONIC_PHRASE = process.env.SECRET;
const INFURA_PROJECT_ID = 'bfea47cc97c440a687c8762553739a94';

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
    },

    ropsten: {
      provider: () =>
        new HDWalletProvider(MNEMONIC_PHRASE, `https://ropsten.infura.io/v3/${INFURA_PROJECT_ID}`),
      network_id: '3',
      gas: 5500000,
      gasPrice: 5000000000
    },

    live: {
      provider: () =>
        new HDWalletProvider(MNEMONIC_PHRASE, `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`),
      network_id: '1',
      gas: 5500000,
      timeoutBlocks: 200,
      gasPrice: 5000000000
    }
  },

  compilers: {
    solc: {
      version: '0.5.1'
    }
  }
};
