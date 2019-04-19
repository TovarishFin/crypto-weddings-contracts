const WeddingManager = artifacts.require('WeddingManager')

module.exports = async (deployer, network, accounts) => {
  deployer.deploy(WeddingManager)

  global.accounts = accounts
}
