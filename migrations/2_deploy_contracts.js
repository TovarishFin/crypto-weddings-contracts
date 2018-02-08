const WeddingManager = artifacts.require('../contracts/WeddingManager.sol')

module.exports = deployer => {
  deployer.deploy(WeddingManager)
}
