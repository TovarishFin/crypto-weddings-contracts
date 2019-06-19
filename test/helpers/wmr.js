const WeddingManagerStub = require('../../build/WeddingManagerStub')
const { gasLimit, addressZero } = require('../helpers/general')
const { Contract } = require('ethers')

const testInitialize = async (context, wallet, weddingMaster) => {
  const { address: weddingMasterAddress } = weddingMaster
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

const testUpdateWeddingMaster = async (context, wallet, weddingMaster) => {
  const { address: weddingMasterAddress } = weddingMaster
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

const testStartWedding = async (context, partner1, partner2, name1, name2) => {
  const { address: p1Address } = partner1
  const { address: p2Address } = partner2
  const { wmr: unconnected } = context
  const wmr = unconnected.connect(partner1)

  const preWeddingsLength = await wmr.weddingsLength()
  const preWeddingOfP1 = await wmr.weddingOf(p1Address)
  const preWeddingOfP2 = await wmr.weddingOf(p2Address)

  const tx = wmr.startWedding(name1, p2Address, name2, {
    gasLimit
  })

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
  expect(postWeddingExists).to.eq(true, 'postWeddingExists should be true')

  return postWeddingAddress
}

const testUpgradeMaster = async (context, wallet, master, upgradeToStub) => {
  const { address: masterAddress } = master
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

const testAddWeddingStub = async (context, weddingStub, partner1, partner2) => {
  const { address: p1Address } = partner1
  const { address: p2Address } = partner2
  const { address: weddingAddress } = weddingStub
  const { wmr: unconnected } = context
  const wmr = unconnected.connect(partner1)

  const preWeddingsLength = await wmr.weddingsLength()
  const preWeddingOfP1 = await wmr.weddingOf(p1Address)
  const preWeddingOfP2 = await wmr.weddingOf(p2Address)

  const tx = wmr.addWeddingStub(weddingAddress, p1Address, p2Address, {
    gasLimit
  })

  await expect(tx).to.emit(wmr, 'WeddingAdded')

  const postWeddingsLength = await wmr.weddingsLength()
  const postWeddingOfP1 = await wmr.weddingOf(p1Address)
  const postWeddingOfP2 = await wmr.weddingOf(p2Address)

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

const testDivorce = async (context, weddingStub, partner1, partner2) => {
  const { address: p1Address } = partner1
  const { address: p2Address } = partner2
  const { address: weddingAddress } = weddingStub
  const { wmr: unconnected } = context
  const wmr = unconnected.connect(weddingStub)

  const preWeddingExists = await wmr.weddingExists(weddingAddress)
  const preWeddingsLength = await wmr.weddingsLength()
  const preWeddingOfPartner1 = await wmr.weddingOf(p1Address)
  const preWeddingOfPartner2 = await wmr.weddingOf(p2Address)

  const tx = wmr.divorce(p1Address, p2Address, { gasLimit })
  await expect(tx).to.emit(wmr, 'WeddingRemoved')

  const postWeddingExists = await wmr.weddingExists(weddingAddress)
  const postWeddingsLength = await wmr.weddingsLength()
  const postWeddingOfPartner1 = await wmr.weddingOf(p1Address)
  const postWeddingOfPartner2 = await wmr.weddingOf(p2Address)

  expect(preWeddingExists).to.eq(true, 'preWeddingExists should be true')
  expect(preWeddingOfPartner1).to.eq(
    weddingAddress,
    'preWeddingOfPartner1 should match weddingStub'
  )
  expect(preWeddingOfPartner2).to.eq(
    weddingAddress,
    'preWeddingOfPartner2 should match weddingStub'
  )
  expect(postWeddingExists).to.eq(false)
  expect(preWeddingsLength.sub(postWeddingsLength)).to.eq(
    1,
    'weddingsLength should be decremented by 1'
  )
  expect(postWeddingOfPartner1).to.eq(
    addressZero,
    'postWeddingOfPartner1 should be addressZero'
  )
  expect(postWeddingOfPartner2).to.eq(
    addressZero,
    'postWeddingOfPartner2 should be addressZero'
  )
}

const testRegisterWedding = async (
  context,
  owner,
  wedding,
  partner1,
  partner2
) => {
  const { address: p1Address } = partner1
  const { address: p2Address } = partner2
  const { address: weddingAddress } = wedding
  const { wmr: unconnected } = context
  const wmr = unconnected.connect(owner)

  const preWeddingsLength = await wmr.weddingsLength()
  const preWeddingOfP1 = await wmr.weddingOf(p1Address)
  const preWeddingOfP2 = await wmr.weddingOf(p2Address)

  const tx = wmr.registerWedding(weddingAddress, p1Address, p2Address, {
    gasLimit
  })

  await expect(tx).to.emit(wmr, 'WeddingAdded')

  const postWeddingsLength = await wmr.weddingsLength()
  const postWeddingOfP1 = await wmr.weddingOf(p1Address)
  const postWeddingOfP2 = await wmr.weddingOf(p2Address)

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

const testDeRegisterWedding = async (
  context,
  owner,
  wedding,
  partner1,
  partner2
) => {
  const { address: p1Address } = partner1
  const { address: p2Address } = partner2
  const { address: weddingAddress } = wedding
  const { wmr: unconnected } = context
  const wmr = unconnected.connect(owner)

  const preWeddingExists = await wmr.weddingExists(weddingAddress)
  const preWeddingsLength = await wmr.weddingsLength()
  const preWeddingOfPartner1 = await wmr.weddingOf(p1Address)
  const preWeddingOfPartner2 = await wmr.weddingOf(p2Address)

  const tx = wmr.deRegisterWedding(weddingAddress, p1Address, p2Address, {
    gasLimit
  })
  await expect(tx).to.emit(wmr, 'WeddingRemoved')

  const postWeddingExists = await wmr.weddingExists(weddingAddress)
  const postWeddingsLength = await wmr.weddingsLength()
  const postWeddingOfPartner1 = await wmr.weddingOf(p1Address)
  const postWeddingOfPartner2 = await wmr.weddingOf(p2Address)

  expect(preWeddingExists).to.eq(true, 'preWeddingExists should be true')
  expect(preWeddingOfPartner1).to.eq(
    weddingAddress,
    'preWeddingOfPartner1 should match weddingStub'
  )
  expect(preWeddingOfPartner2).to.eq(
    weddingAddress,
    'preWeddingOfPartner2 should match weddingStub'
  )
  expect(postWeddingExists).to.eq(false)
  expect(preWeddingsLength.sub(postWeddingsLength)).to.eq(
    1,
    'weddingsLength should be decremented by 1'
  )
  expect(postWeddingOfPartner1).to.eq(
    addressZero,
    'postWeddingOfPartner1 should be addressZero'
  )
  expect(postWeddingOfPartner2).to.eq(
    addressZero,
    'postWeddingOfPartner2 should be addressZero'
  )
}

const testPauseWeddingManager = async (context, wallet) => {
  const { wmr: unconnected } = context
  const wmr = unconnected.connect(wallet)
  const prePaused = await wmr.paused()

  await wmr.pause()

  const postPaused = await wmr.paused()

  expect(prePaused).to.eq(false, 'paused should be false before pausing')
  expect(postPaused).to.eq(true, 'paused should be true after pausing')
}

const testUnpauseWeddingManager = async (context, wallet) => {
  const { wmr: unconnected } = context
  const wmr = unconnected.connect(wallet)
  const prePaused = await wmr.paused()

  await wmr.unpause()

  const postPaused = await wmr.paused()

  expect(prePaused).to.eq(true, 'paused should be true before unpausing')
  expect(postPaused).to.eq(false, 'paused should be false after unppausing')
}

module.exports = {
  testInitialize,
  testUpdateWeddingMaster,
  testStartWedding,
  testUpgradeMaster,
  testAddWeddingStub,
  testDivorce,
  testRegisterWedding,
  testDeRegisterWedding,
  testPauseWeddingManager,
  testUnpauseWeddingManager
}
