const { setupContext, assertRevert } = require('../helpers/general')
const { testInitialize, testUpdateWeddingMaster } = require('../helpers/wmr')

describe.only('when setting base settings for weddngManager', () => {
  let owner
  let other
  let context

  before('setup context', async () => {
    context = await setupContext()
    owner = context.owner
    other = context.other
  })

  it('should NOT initialize as NOT owner with correct address', async () => {
    const { wmrMaster } = context

    await assertRevert(testInitialize(context, other, wmrMaster.address))
  })

  it('should initialize as owner with correct address', async () => {
    const { wmrMaster } = context

    await testInitialize(context, owner, wmrMaster.address)
  })

  it('should NOT updateWeddingMaster as NOT owner', async () => {
    const { wngMaster } = context
    await assertRevert(
      testUpdateWeddingMaster(context, other, wngMaster.address)
    )
  })

  it('should NOT updateWeddingMaster with NON-contract address', async () => {
    await assertRevert(testUpdateWeddingMaster(context, owner, other.address))
  })

  it('should updateWeddingMaster as owner', async () => {
    const { wngMaster } = context
    await testUpdateWeddingMaster(context, owner, wngMaster.address)
  })
})
