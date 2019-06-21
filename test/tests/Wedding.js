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
  testRejectProposal,
  testDivorce,
  testBanUser,
  testUnBanUser,
  testUpdateMinGiftAmount,
  testHideGiftEvents,
  testShowGiftEvents
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
    partner2 = context.partner2
  })

  it('should NOT startNewWedding with empty partner2', async () => {
    await assertRevert(
      testStartWedding(context, partner1, emptyWallet, name1, name2)
    )
  })

  it('should NOT startWedding with empty name1', async () => {
    await assertRevert(testStartWedding(context, partner1, partner2, '', name2))
  })

  it('should NOT startWedding with empty name3', async () => {
    await assertRevert(testStartWedding(context, partner1, partner2, name1, ''))
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
    context = await testStartWedding(context, partner1, partner2, name1, name2)
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

describe('when using core Wedding functionality on an unhappy path', () => {
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
    context = await testStartWedding(context, partner1, partner2, name1, name2)
  })

  it('should rejectProposal as partner1', async () => {
    await testRejectProposal(context, partner1)
  })

  it('should rejectProposal as partner2', async () => {
    await testRejectProposal(context, partner2)
  })

  it('should rejectProposal with non-zero wedding balance as partner1', async () => {
    const amount = parseEther('0.1')
    await testSendWeddingGiftFallback(context, other, amount)
    await testRejectProposal(context, partner1)
  })

  it('should rejectProposal with non-zero wedding balance as partner2', async () => {
    const amount = parseEther('0.1')
    await testSendWeddingGiftFallback(context, other, amount)
    await testRejectProposal(context, partner2)
  })

  it('should NOT rejectProposal as other', async () => {
    await assertRevert(testRejectProposal(context, other))
  })

  it('should divorce as partner1', async () => {
    await testAcceptProposal(context, partner1)
    await testAcceptProposal(context, partner2)
    await testDivorce(context, partner2)
    await testDivorce(context, partner1)
  })

  it('should divorce as partner2', async () => {
    await testAcceptProposal(context, partner1)
    await testAcceptProposal(context, partner2)
    await testDivorce(context, partner1)
    await testDivorce(context, partner2)
  })

  it('should divorce as partner1 with non-zero wedding balance', async () => {
    const amount = parseEther('0.1')
    await testSendWeddingGiftFallback(context, other, amount)
    await testAcceptProposal(context, partner1)
    await testAcceptProposal(context, partner2)
    await testDivorce(context, partner2)
    await testDivorce(context, partner1)
  })

  it('should divorce as partner2 with non-zero wedding balance', async () => {
    const amount = parseEther('0.1')
    await testSendWeddingGiftFallback(context, other, amount)
    await testAcceptProposal(context, partner2)
    await testAcceptProposal(context, partner1)
    await testDivorce(context, partner1)
    await testDivorce(context, partner2)
  })

  it('should NOT start divorce as other', async () => {
    await testAcceptProposal(context, partner2)
    await testAcceptProposal(context, partner1)
    await testDivorce(context, partner1)
    await assertRevert(testDivorce(context, other))
  })

  it('should NOT divorce as other', async () => {
    await testAcceptProposal(context, partner2)
    await testAcceptProposal(context, partner1)
    await testDivorce(context, partner1)
    await assertRevert(testDivorce(context, other))
    await testDivorce(context, partner2)
  })
})

describe('when making adjustments to a wedding', () => {
  let context
  let partner1
  let partner2
  let other
  const name1 = 'bob'
  const name2 = 'alice'
  const updatedMinGiftAmount = parseEther('0.33')

  before('setup context', async () => {
    context = await setupContext()
    partner1 = context.partner1
    partner2 = context.partner2
    other = context.other
    context = await testStartWedding(context, partner1, partner2, name1, name2)
  })

  it('should NOT ban a user as NOT fiance', async () => {
    await assertRevert(testBanUser(context, other, other))
  })

  it('should ban a user as fiance', async () => {
    await testBanUser(context, partner1, other)
  })

  it('should NOT ban a user who has already been banned', async () => {
    await assertRevert(testBanUser(context, partner1, other))
  })

  it('should NOT unban a user as NOT fiance', async () => {
    await assertRevert(testUnBanUser(context, other, other))
  })

  it('should unban a user as fiance', async () => {
    await testUnBanUser(context, partner2, other)
  })

  it('should NOT unban a user who has already been unbanned', async () => {
    await assertRevert(testUnBanUser(context, partner2, other))
  })

  it('should updateMinGiftAmount as fiance', async () => {
    await testUpdateMinGiftAmount(context, partner1, parseEther('0.15'))
    await testUpdateMinGiftAmount(context, partner2, updatedMinGiftAmount)
  })

  it('should NOT updateMinGiftAmount as NOT fiance', async () => {
    await assertRevert(
      testUpdateMinGiftAmount(context, other, parseEther('0.15'))
    )
  })

  it('should NOT sendWeddingGift if less than minGiftAmount', async () => {
    await assertRevert(
      testSendWeddingGift(
        context,
        other,
        updatedMinGiftAmount.sub(1),
        'some message'
      )
    )
  })

  it('should NOT sendWeddingGift through fallback if less than minGiftAmount', async () => {
    await assertRevert(
      testSendWeddingGiftFallback(context, other, updatedMinGiftAmount.sub(1))
    )
  })

  it('should sendWeddingGift if at leastminGiftAmount', async () => {
    await testSendWeddingGift(
      context,
      other,
      updatedMinGiftAmount,
      'some messge'
    )
  })

  it('should sendWeddingGift through fallback if at leastminGiftAmount', async () => {
    await testSendWeddingGiftFallback(context, other, updatedMinGiftAmount)
  })

  it('should NOT updateShouldHideGiftEvents to true as NOT fiance', async () => {
    await assertRevert(testHideGiftEvents(context, other))
  })

  it('should updateShouldHideGiftEvents to true as fiance', async () => {
    await testHideGiftEvents(context, partner1)
  })

  it('should NOT updateShouldHideGiftEvents to false as NOT fiance', async () => {
    await assertRevert(testShowGiftEvents(context, other))
  })

  it('should updateShouldHideGiftEvents to false as fiance', async () => {
    await testShowGiftEvents(context, partner1)
  })
})
