require('babel-register')
require('babel-polyfill')

require('dotenv').config()

const INFURA_API_KEY = process.env.INFURA_API_KEY
const MNEMONIC = process.env.MNEMONIC
const HDWalletProvider = require('truffle-hdwallet-provider')

const NETWORK_IDS = {
  // mainnet: 1,
  ropsten: 3,
  rinkeby: 4,
  kovan: 42
}

module.exports = {
  migrations_directory: './migrations',
  networks: {
    test: {
      host: 'localhost',
      port: 9545,
      network_id: '*',
      gas: 6.5e6,
      gasPrice: 5e9,
      websockets: true
    }
  },
  compilers: {
    solc: {
      version: '^0.5.8',
      settings: {
        optimizer: {
          enabled: true,
          runs: 500
        }
      }
    }
  },
  mocha: {
    reporter: 'mocha-multi-reporters',
    useColors: true,
    enableTimeouts: false,
    reporterOptions: {
      configFile: './mocha-smart-contracts-config.json'
    }
  }
}

for (const networkName in NETWORK_IDS) {
  module.exports.networks[networkName] = {
    provider: new HDWalletProvider(
      MNEMONIC,
      'https://' + networkName + '.infura.io/' + INFURA_API_KEY
    ),
    network_id: NETWORK_IDS[networkName]
  }
}

console.log(module.exports)

// const HDWalletProvider = require('truffle-hdwallet-provider')

// const rinkebyWallet =
//   'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'
// const rinkebyProvider = new HDWalletProvider(
//   rinkebyWallet,
//   'https://rinkeby.infura.io/'
// )

// const ropstenWallet =
//   'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'
// const ropstenProvider = new HDWalletProvider(
//   ropstenWallet,
//   'https://ropsten.infura.io/'
// )
