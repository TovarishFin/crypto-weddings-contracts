const { setupContext, assertRevert } = require('../helpers/general')
const { testInitialize } = require('../helpers/wmr')

describe.only('when using core WeddingManager functionality', () => {
  let owner
  let other
  let context

  before('setup context', async () => {
    context = await setupContext()
    owner = context.owner
    other = context.other
  })

  it('should initialize as owner with correct address', async () => {
    const { wmrMaster } = context

    await testInitialize(context, wmrMaster.address, owner)
  })

  it('should NOT initialize as NOT owner with correct address', async () => {
    const { wmrMaster } = context

    await assertRevert(testInitialize(context, wmrMaster.address, other))
  })
})
