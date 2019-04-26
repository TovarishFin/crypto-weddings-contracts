const { setupContext, assertRevert } = require('../helpers/general')
const {
  testInitialize,
  testUpdateWeddingMaster,
  testStartWedding,
  testUpgradeMaster
} = require('../helpers/wmr')

let owner
let other
let context

describe('when setting base settings for weddngManager', () => {
  before('setup context', async () => {
    context = await setupContext(true)
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

describe('when upgrading weddingManager', async () => {
  let wmrMasterStub

  before('setup context', async () => {
    context = await setupContext()
    wmrMasterStub = context.wmrMasterStub.address
  })

  it('should NOT upgrade to stub if NOT owner', async () => {
    await assertRevert(testUpgradeMaster(context, other, wmrMasterStub, true))
  })

  it('should NOT upgrade to stub if NOT contract', async () => {
    await assertRevert(testUpgradeMaster(context, owner, other.address, true))
  })

  it('should upgrade to stub version', async () => {
    await testUpgradeMaster(context, owner, wmrMasterStub, true)
  })
})

describe('when using weddingManager core functionality', async () => {
  let partner1
  let partner2

  before('setup context', async () => {
    context = await setupContext()
    owner = context.owner
    other = context.other
    partner1 = context.partner1
    partner2 = context.partner2
    await testUpgradeMaster(context, owner, context.wmrMasterStub.address, true)
  })

  it('should startWedding', async () => {
    await testStartWedding(context, partner1, partner2, 'bob', 'alice', 1)
  })
})
