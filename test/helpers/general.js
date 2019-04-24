const WeddingManager = require('../../build/WeddingManager')
const Wedding = require('../../build/Wedding')
const UpgradeableProxy = require('../../build/UpgradeableProxy')
const chalk = require('chalk')
const assert = require('assert')

const {
  deployContract,
  createMockProvider,
  getWallets
} = require('ethereum-waffle')
const { Contract } = require('ethers')

const addressZero = `0x${'0'.repeat(40)}`
const bytes32Zero = '0x' + '00'.repeat(32)
const gasLimit = 5e6

const assertRevert = async promise => {
  try {
    await promise
    assert.fail('Expected revert not received')
  } catch (error) {
    const revertFound = error.message.search('revert') >= 0
    assert(revertFound, `Expected "revert", got ${error} instead`)
  }
}

const waitForEvent = (contract, eventName, optTimeout) =>
  new Promise(resolve => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout)
      // eslint-disable-next-line no-console
      console.log(
        chalk.yellow(
          '⚠️  timeout waiting for event. This can and SHOULD happen when testing for failing contract functions'
        )
      )
      return resolve(false)
    }, optTimeout || 5000)

    contract.on(eventName, (x, xx, xxx, xxxx) => {
      contract.removeAllListeners(eventName)
      clearTimeout(timeout)
      // this function is really unreliable and returns args in different
      // param locations...
      const eventData = [x, xx, xxx, xxxx].reduce((acc, item) => {
        if (item && item.args) {
          return item
        } else {
          return acc
        }
      }, {})
      resolve(eventData)
    })
  })

const getAllSimpleStorage = async (context, addr) => {
  const { provider } = context
  let slot = 0
  let zeroCounter = 0
  const simpleStorage = []
  while (zeroCounter < 10) {
    const data = await provider.getStorageAt(addr, slot)
    if (data === '0x00') {
      zeroCounter++
    }

    simpleStorage.push({ slot, data })
    slot++
  }

  return simpleStorage
}

const setupContext = async () => {
  const provider = createMockProvider()
  const wallets = getWallets(provider)
  const [owner, partner1, partner2, other] = wallets

  const wngMaster = await deployContract(owner, Wedding)
  const wmrMaster = await deployContract(owner, WeddingManager)

  const wmrProxy = await deployContract(owner, UpgradeableProxy, [
    wmrMaster.address
  ])
  const wmr = new Contract(wmrProxy.address, WeddingManager.abi, owner)

  return {
    provider,
    wallets,
    owner,
    partner1,
    partner2,
    other,
    wngMaster,
    wmrMaster,
    wmrProxy,
    wmr
  }
}

module.exports = {
  addressZero,
  bytes32Zero,
  gasLimit,
  setupContext,
  assertRevert,
  waitForEvent,
  getAllSimpleStorage
}
