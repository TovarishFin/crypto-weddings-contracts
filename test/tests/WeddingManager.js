const { setupContext, assertRevert, gasLimit } = require('../helpers/general')
const {
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

  it('should NOT pause weddingManager as NOT owner', async () => {
    await assertRevert(testPauseWeddingManager(context, other))
  })

  it('should pause weddingManager as owner', async () => {
    await testPauseWeddingManager(context, owner)
  })

  it('should NOT pause weddingManager as owner again', async () => {
    await assertRevert(testPauseWeddingManager(context, owner))
  })

  it('should NOT unpause weddingManager as NOT owner', async () => {
    await assertRevert(testUnpauseWeddingManager(context, other))
  })

  it('should unpause weddingManager as owner', async () => {
    await testUnpauseWeddingManager(context, owner)
  })

  it('should NOT unpause weddingManager as owner again', async () => {
    await assertRevert(testUnpauseWeddingManager(context, owner))
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
    weddingStub = context.weddingStub
    partner1 = context.partner1
    partner2 = context.partner2
    const wallets = context.wallets
    partner3 = wallets[9]
    partner4 = wallets[8]
    await testUpgradeMaster(context, owner, context.wmrMasterStub, true)
  })

  it('should NOT startWedding when paused', async () => {
    await testPauseWeddingManager(context, owner)
    await assertRevert(
      testStartWedding(context, partner1, partner2, 'bob', 'alice')
    )
    await testUnpauseWeddingManager(context, owner)
  })

  it('should startWedding when NOT paused', async () => {
    await testStartWedding(context, partner1, partner2, 'bob', 'alice')
  })

  it('should NOT startWedding for someone already married', async () => {
    await assertRevert(
      testStartWedding(context, partner1, partner3, 'bob', 'pat')
    )
    await assertRevert(
      testStartWedding(context, partner3, partner2, 'pat', 'alice')
    )
  })

  it('should divorce', async () => {
    await testAddWeddingStub(context, weddingStub, partner3, partner4)
    await testDivorce(context, weddingStub, partner3, partner4)
  })

  it('should NOT divorce again', async () => {
    await assertRevert(testDivorce(context, weddingStub, partner3, partner4))
  })

  it('should deRegisterWedding as wedding', async () => {
    await testAddWeddingStub(context, weddingStub, partner3, partner4)
    await testDeRegisterWedding(
      context,
      weddingStub,
      weddingStub,
      partner3,
      partner4
    )
  })

  it('should NOT deRegisterWedding as wedding again', async () => {
    await assertRevert(
      testDeRegisterWedding(
        context,
        weddingStub,
        weddingStub,
        partner3,
        partner4
      )
    )
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
    weddingStub = context.weddingStub
    partner1 = context.partner1
    partner2 = context.partner2
  })

  it('should NOT registerWedding as NOT owner', async () => {
    await assertRevert(
      testRegisterWedding(context, other, weddingStub, partner1, partner2)
    )
  })

  it('should registerWedding as owner', async () => {
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

describe('when emitting events directly using wedding stub', async () => {
  let wmr
  let weddingStub
  let p1Address
  let p2Address

  before('setup context', async () => {
    context = await setupContext()
    wmr = context.wmr
    owner = context.owner
    other = context.other
    weddingStub = context.weddingStub
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

  it('should NOT emitUserPermissionUpdated as NOT wedding', async () => {
    wmr = wmr.connect(other)
    await assertRevert(
      wmr.emitUserPermissionUpdated(p1Address, true, { gasLimit })
    )
  })

  it('should emitUserPermissionUpdated as wedding', async () => {
    wmr = wmr.connect(weddingStub)
    const tx = wmr.emitUserPermissionUpdated(p1Address, true, { gasLimit })
    await expect(tx).to.emit(wmr, 'UserPermissionUpdated')
  })

  it('should NOT emitMinGiftAmountUpdated as NOT wedding', async () => {
    wmr = wmr.connect(other)
    await assertRevert(
      wmr.emitMinGiftAmountUpdated(parseEther('0.777'), { gasLimit })
    )
  })

  it('should emitMinGiftAmountUpdated as wedding', async () => {
    wmr = wmr.connect(weddingStub)
    const tx = wmr.emitMinGiftAmountUpdated(parseEther('0.777'), { gasLimit })
    await expect(tx).to.emit(wmr, 'MinGiftAmountUpdated')
  })

  it('should NOT emitShouldHideGiftEventsUpdated as NOT wedding', async () => {
    wmr = wmr.connect(other)
    await assertRevert(wmr.emitShouldHideGiftEventsUpdated(true, { gasLimit }))
  })

  it('should emitShouldHideGiftEventsUpdated as wedding', async () => {
    wmr = wmr.connect(weddingStub)
    const tx = wmr.emitShouldHideGiftEventsUpdated(true, { gasLimit })
    await expect(tx).to.emit(wmr, 'ShouldHideGiftEventsUpdated')
  })
})

describe('when emitting events indirectly using wngEventEmitter', async () => {
  let wmr
  let wngEmitterStub
  let p1Address
  let p2Address

  before('setup context', async () => {
    context = await setupContext()
    wmr = context.wmr
    owner = context.owner
    other = context.other
    p1Address = context.partner1.address
    p2Address = context.partner2.address
    wngEmitterStub = context.wngEmitterStub

    await testUpgradeMaster(context, owner, context.wmrMasterStub, true)
    await testAddWeddingStub(
      context,
      wngEmitterStub,
      context.partner1,
      context.partner2
    )
  })

  it('should emitPartnerAccepts as wedding wedding emitter', async () => {
    wmr = wmr.connect(other)
    const tx = wngEmitterStub.emitPartnerAcceptsExternal(
      wmr.address,
      p1Address,
      { gasLimit }
    )

    await expect(tx).to.emit(wmr, 'PartnerAccepts')
  })

  it('should emitPartnerDivorces as wedding', async () => {
    wmr = wmr.connect(other)
    const tx = wngEmitterStub.emitPartnerDivorcesExternal(
      wmr.address,
      p1Address,
      { gasLimit }
    )
    await expect(tx).to.emit(wmr, 'PartnerDivorces')
  })

  it('should emitWeddingPhotoUpdated as wedding', async () => {
    wmr = wmr.connect(other)
    const tx = wngEmitterStub.emitWeddingPhotoUpdatedExternal(
      wmr.address,
      'someuri',
      {
        gasLimit
      }
    )
    await expect(tx).to.emit(wmr, 'WeddingPhotoUpdated')
  })

  it('should emitWeddingCancelled as wedding', async () => {
    wmr = wmr.connect(other)
    const tx = wngEmitterStub.emitWeddingCancelledExternal(
      wmr.address,
      p2Address,
      {
        gasLimit
      }
    )
    await expect(tx).to.emit(wmr, 'WeddingCancelled')
  })

  it('should emitMarried as wedding', async () => {
    wmr = wmr.connect(other)
    const tx = wngEmitterStub.emitMarriedExternal(
      wmr.address,
      p1Address,
      p2Address,
      {
        gasLimit
      }
    )
    await expect(tx).to.emit(wmr, 'Married')
  })

  it('should emitGiftReceived as wedding', async () => {
    wmr = wmr.connect(other)
    const tx = wngEmitterStub.emitGiftReceivedExternal(
      wmr.address,
      other.address,
      parseEther('1'),
      'merry x-mas... wait what?',
      {
        gasLimit
      }
    )
    await expect(tx).to.emit(wmr, 'GiftReceived')
  })

  it('should emitUserPermissionUpdated as wedding', async () => {
    wmr = wmr.connect(other)
    const tx = wngEmitterStub.emitUserPermissionUpdatedExternal(
      wmr.address,
      p1Address,
      true,
      { gasLimit }
    )
    await expect(tx).to.emit(wmr, 'UserPermissionUpdated')
  })

  it('should emitMinGiftAmountUpdated as wedding', async () => {
    wmr = wmr.connect(other)
    const tx = wngEmitterStub.emitMinGiftAmountUpdatedExternal(
      wmr.address,
      parseEther('0.777'),
      { gasLimit }
    )
    await expect(tx).to.emit(wmr, 'MinGiftAmountUpdated')
  })

  it('should emitShouldHideGiftEventsUpdated as wedding', async () => {
    wmr = wmr.connect(other)
    const tx = wngEmitterStub.emitShouldHideGiftEventsUpdatedExternal(
      wmr.address,
      true,
      {
        gasLimit
      }
    )
    await expect(tx).to.emit(wmr, 'ShouldHideGiftEventsUpdated')
  })
})
