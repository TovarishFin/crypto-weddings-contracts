const WeddingManagerStub = require('../../build/WeddingManagerStub')
const { gasLimit, addressZero } = require('../helpers/general')
const { Contract } = require('ethers')

const testInitialize = async (context, wallet, weddingMasterAddress) => {
  const { wmr: unconnected } = context
  const wmr = unconnected.connect(wallet)

  const preInitialized = await wmr.initialized()

  await wmr.initialize(weddingMasterAddress, { gasLimit })

  const postInitialized = await wmr.initialized()
  const postWeddingMaster = await wmr.weddingMaster()

  expect(preInitialized).to.eq(false, 'preInitialized should be false')
  expect(postWeddingMaster).to.eq(
    weddingMasterAddress,
    'postWeddingMaster should match weddingMasterAddress'
  )
  expect(postInitialized).to.eq(true, 'postInitialized should be true')
}

const testUpdateWeddingMaster = async (
  context,
  wallet,
  weddingMasterAddress
) => {
  const { wmr: unconnected } = context
  const wmr = unconnected.connect(wallet)

  const preWeddingMaster = await wmr.weddingMaster()

  await wmr.updateWeddingMaster(weddingMasterAddress, { gasLimit })

  const postWeddingMaster = await wmr.weddingMaster()

  expect(preWeddingMaster).to.not.eq(
    postWeddingMaster,
    'preWeddingMaster should not match postWeddingMaster'
  )
  expect(postWeddingMaster).to.eq(
    weddingMasterAddress,
    'postWeddingMaster should match weddingMasterAddress'
  )
}

const testStartWedding = async (
  context,
  partner1,
  partner2,
  name1,
  name2,
  weddingType
) => {
  const { wmr: unconnected } = context
  const wmr = unconnected.connect(partner1)

  const preWeddingsLength = await wmr.weddingsLength()
  const preWeddingOfP1 = await wmr.weddingOf(partner1.address)
  const preWeddingOfP2 = await wmr.weddingOf(partner2.address)

  const tx = wmr.startWedding(
    partner1.address,
    name1,
    partner2.address,
    name2,
    weddingType,
    { gasLimit }
  )

  await expect(tx).to.emit(wmr, 'WeddingAdded')

  const postWeddingsLength = await wmr.weddingsLength()
  const postWeddingOfP1 = await wmr.weddingOf(partner1.address)
  const postWeddingOfP2 = await wmr.weddingOf(partner2.address)

  const postWeddingAddress = await wmr.weddings(preWeddingsLength.toNumber())
  const postWeddingExists = await wmr.weddingExists(postWeddingAddress)

  expect(preWeddingOfP1).to.eq(
    addressZero,
    'preWeddingOfP1 should be addressZero'
  )
  expect(preWeddingOfP2).to.eq(
    addressZero,
    'preWeddingOfP2 should be addressZero'
  )
  expect(postWeddingsLength.sub(preWeddingsLength)).to.eq(
    1,
    'weddingsLength should be incremented by 1'
  )
  expect(postWeddingOfP1).to.eq(
    postWeddingAddress,
    'postWeddingOfP1 should match postWeddingAddress'
  )
  expect(postWeddingOfP2).to.eq(
    postWeddingAddress,
    'postWeddingOfP2 should match postWeddingAddress'
  )
  expect(postWeddingExists).to.eq(true)
}

const testUpgradeMaster = async (
  context,
  wallet,
  masterAddress,
  upgradeToStub
) => {
  const { wmr: unconnected } = context
  let wmr = unconnected.connect(wallet)

  const preMaster = await wmr.masterContract()

  const tx = wmr.upgradeMaster(masterAddress, { gasLimit })

  await expect(tx).to.emit(wmr, 'MasterContractUpgraded')
  wmr = new Contract(wmr.address, WeddingManagerStub.abi, wallet)

  const postMaster = await wmr.masterContract()
  const postIsStub = await wmr.isStub()

  expect(postMaster).to.eq(
    masterAddress,
    'postMaster should match masterAddress'
  )
  expect(postMaster).to.not.eq(
    preMaster,
    'postMaster should NOT match preMaster'
  )

  if (upgradeToStub) {
    expect(postIsStub).to.eq(true)
  }

  context.wmr = wmr
}

module.exports = {
  testInitialize,
  testUpdateWeddingMaster,
  testStartWedding,
  testUpgradeMaster
}
