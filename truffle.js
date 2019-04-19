module.exports = {
  networks: {
    dev: {
      host: 'localhost',
      port: 8545,
      network_id: '*'
    },
    ropsten: {
      host: 'localhost',
      port: 8545,
      network_id: 3,
      gas: 46e5,
      gasPrice: 50e9
    },
    kovan: {
      host: 'localhost',
      port: 8545,
      network_id: 42,
      gas: 6e6,
      gasPrice: 20e9
    }
  },
  compilers: {
    solc: {
      version: '0.5.7'
    }
  }
}
