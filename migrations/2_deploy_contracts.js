const WeddingManager = artifacts.require('WeddingManager.sol')

module.exports = deployer => {
  deployer.deploy(WeddingManager)
}
