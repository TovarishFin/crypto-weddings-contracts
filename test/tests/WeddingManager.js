const { setupContext, assertRevert, gasLimit } = require('../helpers/general')
const {
  testInitialize,
  testUpdateWeddingMaster,
  testStartWedding,
  testUpgradeMaster,
  testAddWeddingStub,
  testDivorce,
  testRegisterWedding,
  testDeRegisterWedding
} = require('../helpers/wmr')
const {
  utils: { parseEther }
} = require('ethers')

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

    await assertRevert(testInitialize(context, other, wmrMaster))
  })

  it('should initialize as owner with correct address', async () => {
    const { wmrMaster } = context

    await testInitialize(context, owner, wmrMaster)
  })

  it('should NOT updateWeddingMaster as NOT owner', async () => {
    const { wngMaster } = context
    await assertRevert(testUpdateWeddingMaster(context, other, wngMaster))
  })

  it('should NOT updateWeddingMaster with NON-contract address', async () => {
    await assertRevert(testUpdateWeddingMaster(context, owner, other))
  })

  it('should updateWeddingMaster as owner', async () => {
    const { wngMaster } = context
    await testUpdateWeddingMaster(context, owner, wngMaster)
  })
})

describe('when upgrading weddingManager', async () => {
  let wmrMasterStub

  before('setup context', async () => {
    context = await setupContext()
    wmrMasterStub = context.wmrMasterStub
  })

  it('should NOT upgrade to stub if NOT owner', async () => {
    await assertRevert(testUpgradeMaster(context, other, wmrMasterStub, true))
  })

  it('should NOT upgrade to stub if NOT contract', async () => {
    await assertRevert(testUpgradeMaster(context, owner, other, true))
  })

  it('should upgrade to stub version', async () => {
    await testUpgradeMaster(context, owner, wmrMasterStub, true)
  })
})

describe('when using weddingManager core functionality', async () => {
  let partner1
  let partner2
  let partner3
  let partner4
  let weddingStub

  before('setup context', async () => {
    context = await setupContext()
    owner = context.owner
    other = context.other
    weddingStub = other
    partner1 = context.partner1
    partner2 = context.partner2
    const wallets = context.wallets
    partner3 = wallets[9]
    partner4 = wallets[8]
    await testUpgradeMaster(context, owner, context.wmrMasterStub, true)
  })

  it('should startWedding', async () => {
    await testStartWedding(context, partner1, partner2, 'bob', 'alice', 1)
  })

  it('should NOT startWedding for someone already married', async () => {
    await assertRevert(
      testStartWedding(context, partner1, partner3, 'bob', 'pat', 1)
    )
    await assertRevert(
      testStartWedding(context, partner3, partner2, 'pat', 'alice', 1)
    )
  })

  it('should divorce', async () => {
    await testAddWeddingStub(context, weddingStub, partner3, partner4)
    await testDivorce(context, weddingStub, partner3, partner4)
  })

  it('should NOT divorce again', async () => {
    await assertRevert(testDivorce(context, weddingStub, partner3, partner4))
  })
})

describe('when using weddingManager owner functionality', async () => {
  let partner1
  let partner2
  let weddingStub

  before('setup context', async () => {
    context = await setupContext()
    owner = context.owner
    other = context.other
    weddingStub = other
    partner1 = context.partner1
    partner2 = context.partner2
  })

  it('should NOT registerWedding as NOT owner', async () => {
    await assertRevert(
      testRegisterWedding(context, other, weddingStub, partner1, partner2)
    )
  })

  it('should registerWedding', async () => {
    await testRegisterWedding(context, owner, weddingStub, partner1, partner2)
  })

  it('should NOT RegisterWedding again when same wedding', async () => {
    await assertRevert(
      testRegisterWedding(context, owner, weddingStub, partner1, partner2)
    )
  })

  it('should NOT deRegisterWedding when NOT owner', async () => {
    await assertRevert(
      testDeRegisterWedding(context, other, weddingStub, partner1, partner2)
    )
  })

  it('should deRegisterWedding', async () => {
    await testDeRegisterWedding(context, owner, weddingStub, partner1, partner2)
  })

  it('should NOT deRegisterWedding again when same wedding', async () => {
    await assertRevert(
      testDeRegisterWedding(context, owner, weddingStub, partner1, partner2)
    )
  })
})

describe.only('when emitting events from a wedding', async () => {
  let wmr
  let weddingStub
  let p1Address
  let p2Address

  before('setup context', async () => {
    context = await setupContext()
    wmr = context.wmr
    owner = context.owner
    other = context.other
    weddingStub = context.wallets[9]
    p1Address = context.partner1.address
    p2Address = context.partner2.address

    await testUpgradeMaster(context, owner, context.wmrMasterStub, true)
    await testAddWeddingStub(
      context,
      weddingStub,
      context.partner1,
      context.partner2
    )
  })

  it('should NOT emitPartnerAccepts as NOT wedding', async () => {
    wmr = wmr.connect(other)
    await assertRevert(wmr.emitPartnerAccepts(p1Address, { gasLimit }))
  })

  it('should emitPartnerAccepts as wedding', async () => {
    wmr = wmr.connect(weddingStub)
    const tx = wmr.emitPartnerAccepts(p1Address, { gasLimit })
    await expect(tx).to.emit(wmr, 'PartnerAccepts')
  })

  it('should NOT emitPartnerDivorces as NOT wedding', async () => {
    wmr = wmr.connect(other)
    await assertRevert(wmr.emitPartnerDivorces(p1Address, { gasLimit }))
  })

  it('should emitPartnerDivorces as wedding', async () => {
    wmr = wmr.connect(weddingStub)
    const tx = wmr.emitPartnerDivorces(p1Address, { gasLimit })
    await expect(tx).to.emit(wmr, 'PartnerDivorces')
  })

  it('should NOT emitWeddingPhotoUpdated as NOT wedding', async () => {
    wmr = wmr.connect(other)
    await assertRevert(wmr.emitWeddingPhotoUpdated('someuri', { gasLimit }))
  })

  it('should emitWeddingPhotoUpdated as wedding', async () => {
    wmr = wmr.connect(weddingStub)
    const tx = wmr.emitWeddingPhotoUpdated('someuri', { gasLimit })
    await expect(tx).to.emit(wmr, 'WeddingPhotoUpdated')
  })

  it('should NOT emitWeddingCancelled as NOT wedding', async () => {
    wmr = wmr.connect(other)
    await assertRevert(wmr.emitWeddingCancelled(p2Address, { gasLimit }))
  })

  it('should emitWeddingCancelled as wedding', async () => {
    wmr = wmr.connect(weddingStub)
    const tx = wmr.emitWeddingCancelled(p2Address, { gasLimit })
    await expect(tx).to.emit(wmr, 'WeddingCancelled')
  })

  it('should NOT emitMarried as NOT wedding', async () => {
    wmr = wmr.connect(other)
    await assertRevert(wmr.emitMarried(p1Address, p2Address, { gasLimit }))
  })

  it('should emitMarried as wedding', async () => {
    wmr = wmr.connect(weddingStub)
    const tx = wmr.emitMarried(p1Address, p2Address, { gasLimit })
    await expect(tx).to.emit(wmr, 'Married')
  })

  it('should NOT emitDivorced as NOT wedding', async () => {
    wmr = wmr.connect(other)
    await assertRevert(wmr.emitDivorced(p1Address, p2Address, { gasLimit }))
  })

  it('should emitDivorced as wedding', async () => {
    wmr = wmr.connect(weddingStub)
    const tx = wmr.emitDivorced(p1Address, p2Address, { gasLimit })
    await expect(tx).to.emit(wmr, 'Divorced')
  })

  it('should NOT emitGiftReceived as NOT wedding', async () => {
    wmr = wmr.connect(other)
    await assertRevert(
      wmr.emitGiftReceived(
        other.address,
        parseEther('1'),
        'merry x-mas... wait what?',
        {
          gasLimit
        }
      )
    )
  })

  it('should emitGiftReceived as wedding', async () => {
    wmr = wmr.connect(weddingStub)
    const tx = wmr.emitGiftReceived(
      other.address,
      parseEther('1'),
      'merry x-mas... wait what?',
      {
        gasLimit
      }
    )
    await expect(tx).to.emit(wmr, 'GiftReceived')
  })
})
