const {
  setupContext,
  assertRevert,
  addressZero
} = require('../helpers/general')
const {
  testStartWedding,
  testUpdateVows,
  testAcceptProposal,
  testUpdateWeddingPhoto,
  testSendWeddingGiftFallback,
  testSendWeddingGift,
  testClaimWeddingGifts,
  testRejectProposal
} = require('../helpers/wng')
const {
  utils: { parseEther }
} = require('ethers')

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

  it('should NOT startWedding with empty name3', async () => {
    await assertRevert(
      testStartWedding(context, partner1, partner2, name1, '', 1)
    )
  })
})

describe('when using core Wedding functionality on a happy path', () => {
  let context
  let partner1
  let partner2
  let other
  const name1 = 'bob'
  const name2 = 'alice'

  before('setup context', async () => {
    context = await setupContext()
    partner1 = context.partner1
    partner2 = context.partner2
    other = context.other
    context = await testStartWedding(
      context,
      partner1,
      partner2,
      name1,
      name2,
      1
    )
  })

  it('should NOT updateVows as NOT partner1 or partner2', async () => {
    const vows = 'test vows'
    await assertRevert(testUpdateVows(context, other, vows))
  })

  it('should updateVows as partner1', async () => {
    const vows = 'I will do stuff'
    await testUpdateVows(context, partner1, vows)
  })

  it('should updateVows as partner2', async () => {
    const vows = 'I will do things'
    await testUpdateVows(context, partner2, vows)
  })

  it('should NOT acceptProposal as NOT fiance', async () => {
    await assertRevert(testAcceptProposal(context, other))
  })

  it('should acceptProposal as partner1', async () => {
    await testAcceptProposal(context, partner1)
  })

  it('should acceptProposal as partner2', async () => {
    await testAcceptProposal(context, partner2)
  })

  it('should NOT acceptProposal again', async () => {
    await assertRevert(testAcceptProposal(context, partner2))
  })

  it('should NOT updateWeddingPhoto as NOT fiance', async () => {
    const testUri = 'ipfsMaybe?'
    await assertRevert(testUpdateWeddingPhoto(context, other, testUri))
  })

  it('should updateWeddingPhoto as partner1', async () => {
    const testUri = 'ipfsMaybe?'
    await testUpdateWeddingPhoto(context, partner1, testUri)
  })

  it('should updateWeddingPhoto as partner2', async () => {
    const testUri = 'anotherIpfsMaybe?'
    await testUpdateWeddingPhoto(context, partner2, testUri)
  })

  it('should sendWeddingGift when using fallback function', async () => {
    const amount = parseEther('0.1')
    await testSendWeddingGiftFallback(context, other, amount)
  })

  it('should sendWeddingGift using designated function', async () => {
    const amount = parseEther('0.1')
    const message = 'hey buuuuuuudy'
    await testSendWeddingGift(context, other, amount, message)
  })

  it('should NOT claimWeddingGifts as NOT fiance', async () => {
    await assertRevert(testClaimWeddingGifts(context, other))
  })

  it('should claimWeddingGifts', async () => {
    await testClaimWeddingGifts(context, partner1)
  })

  it('should NOT claimWeddingGifts as fiance when NO balance', async () => {
    await assertRevert(testClaimWeddingGifts(context, partner1))
  })
})

describe.only('when using core Wedding functionality on a unhappy path', () => {
  let context
  let partner1
  let partner2
  let other
  const name1 = 'bob'
  const name2 = 'alice'

  beforeEach('setup context', async () => {
    context = await setupContext()
    partner1 = context.partner1
    partner2 = context.partner2
    other = context.other
    context = await testStartWedding(
      context,
      partner1,
      partner2,
      name1,
      name2,
      1
    )
  })

  it('should rejectProposal as partner1', async () => {
    await testRejectProposal(context, partner1)
  })

  it('should divorce', async () => {
    await testAcceptProposal(context, partner1)
    await testAcceptProposal(context, partner2)
  })
})
