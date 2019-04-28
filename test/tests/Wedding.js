const {
  setupContext,
  assertRevert,
  addressZero
} = require('../helpers/general')
const { testStartWedding, testUpdateVows } = require('../helpers/wng')

describe('when creating a new wedding', () => {
  let context
  let partner1
  let partner2
  const name1 = 'bob'
  const name2 = 'alice'
  const emptyWallet = { address: addressZero }

  before('setup context', async () => {
    context = await setupContext()
    partner1 = context.partner1
    partner2 = context.partner1
  })

  it('should NOT startNewWedding with empty partner2', async () => {
    await assertRevert(
      testStartWedding(context, partner1, emptyWallet, name1, name2, 1)
    )
  })

  it('should NOT startWedding with empty name1', async () => {
    await assertRevert(
      testStartWedding(context, partner1, partner2, '', name2, 1)
    )
  })

  it('should NOT startWedding with empty name2', async () => {
    await assertRevert(
      testStartWedding(context, partner1, partner2, name1, '', 1)
    )
  })
})

describe('when using core Wedding functionality', () => {
  let context
  let partner1
  let partner2
  const name1 = 'bob'
  const name2 = 'alice'

  before('setup context', async () => {
    context = await setupContext()
    partner1 = context.partner1
    partner2 = context.partner1
    context = await testStartWedding(
      context,
      partner1,
      partner2,
      name1,
      name2,
      1
    )
  })

  it('should updateVows as partner1', async () => {
    const vows = 'I will do stuff'
    await testUpdateVows(context, partner1, vows)
  })

  it('should updateVows as partner2', async () => {
    const vows = 'I will do things'
    await testUpdateVows(context, partner2, vows)
  })
})
