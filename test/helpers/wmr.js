const { gasLimit } = require('../helpers/general')

const testInitialize = async (context, weddingMasterAddress, wallet) => {
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

module.exports = {
  testInitialize
}
