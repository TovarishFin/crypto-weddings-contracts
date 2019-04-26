const { gasLimit } = require('../helpers/general')

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

module.exports = {
  testInitialize,
  testUpdateWeddingMaster
}
