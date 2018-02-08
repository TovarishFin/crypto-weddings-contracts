/* global artifacts, describe, it, before, beforeEach contract, web3 */
const assert = require('assert')
const BigNumber = require('bignumber.js')
// smart contracts
const WeddingManager = artifacts.require('WeddingManager')
const TraditionalWedding = artifacts.require('TraditionalWedding')
// test utils

const {
  testWillThrow,
  getEtherBalance,
  getTxInfo
} = require('./utils/testUtils')

// default test values
const defaultMarriageFee = new BigNumber(25e16)
const defaultDivorceFee = new BigNumber(25e17)
const gasPrice = new BigNumber(30e9)

describe('when starting an unhappy wedding', () => {
  contract('TraditionalWedding', accounts => {
    /* eslint-disable max-len */
    const owner = accounts[0]
    // traditional wedding
    const brideAddress = accounts[1]
    const groomAddress = accounts[2]
    const brideName = 'Ella'
    const groomName = 'Bob'
    const brideVows =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam quam nunc, rutrum hendrerit odio eu, fermentum ultrices elit. Cras et dolor fringilla, blandit arcu id, fringilla mauris. Quisque imperdiet felis arcu, vel dapibus ipsum vulputate eget. Integer suscipit feugiat velit nec vulputate. Nam euismod enim nec orci facilisis faucibus. Morbi et leo a nibh suscipit cursus. Fusce quis tempus lacus, et consectetur turpis. Vivamus eu neque rhoncus, suscipit diam nec, pellentesque urna. Nullam aliquet, ipsum porta tincidunt facilisis, ipsum quam aliquet lectus, non egestas lacus sapien vitae nibh. Mauris consequat eget quam non ornare.'
    const groomVows =
      'Proin ut ultrices lectus. Duis sed commodo ligula. Sed fringilla metus et condimentum malesuada. Proin consectetur eros diam, ac sagittis ligula efficitur at. In nulla turpis, iaculis nec cursus posuere, luctus accumsan lacus. Ut in neque convallis, aliquam tellus sit amet, porttitor elit. Etiam efficitur ante quis lacus elementum, nec semper quam ultrices. Nunc congue lobortis libero non porta. Etiam ante leo, gravida non sem at, porta scelerisque libero. Nam consequat, nunc eget euismod dapibus, nibh ex maximus quam, a interdum diam augue sed ante. Praesent finibus tincidunt augue, vitae auctor dolor viverra ac. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur tincidunt rutrum risus, nec dignissim urna gravida at. Nunc pulvinar felis aliquet, accumsan dolor vitae, tristique odio.'

    let wdm
    let tdm
    /* eslint-enable max-len */
    before('setup contract/state', async () => {
      wdm = await WeddingManager.new()
      await wdm.startWedding.sendTransaction(
        brideAddress,
        brideName,
        brideVows,
        groomAddress,
        groomName,
        groomVows,
        {
          from: groomAddress,
          value: defaultMarriageFee
        }
      )
      const tdmAddress = await wdm.weddingOf(groomAddress)
      tdm = await TraditionalWedding.at(tdmAddress)
    })

    it('should start with the correct values', async () => {
      const weddingManager = await tdm.weddingManager()
      const actualBrideAddress = await tdm.bride()
      const actualGroomAddress = await tdm.groom()
      const actualGroomName = await tdm.groomName()
      const actualBrideName = await tdm.brideName()
      const actualBrideVows = await tdm.brideVows()
      const actualGroomVows = await tdm.groomVows()
      const actualBrideSaysYes = await tdm.brideSaysYes()
      const actualGroomSaysYes = await tdm.groomSaysYes()
      const actualMarried = await tdm.married()

      assert.equal(
        weddingManager,
        wdm.address,
        'the weddingManager should be the address that created the wedding'
      )
      assert.equal(
        actualBrideAddress,
        brideAddress,
        'the brideAddress should match actualBrideAddress'
      )
      assert.equal(
        actualGroomAddress,
        groomAddress,
        'the groomAddress should match actualGroomAddress'
      )
      assert.equal(
        actualGroomName,
        groomName,
        'the groomName should match actualGroomName'
      )
      assert.equal(
        actualBrideName,
        brideName,
        'the brideName should match actualBrideName'
      )
      assert.equal(
        actualBrideVows,
        brideVows,
        'the brideVows should match actualBrideVows'
      )
      assert.equal(
        actualGroomVows,
        groomVows,
        'the groomVows should match actualGroomVows'
      )
      assert.equal(false, actualBrideSaysYes, 'brideSaysYes should start false')
      assert.equal(false, actualGroomSaysYes, 'groomSaysYes should start false')
      assert.equal(false, actualMarried, 'the married should start false')
    })

    it('should NOT allow non fiances to say acceptProposal', async () => {
      await testWillThrow(tdm.acceptProposal, [
        {
          from: owner
        }
      ])
    })

    it('should NOT allow non fiances to say rejectProposal', async () => {
      await testWillThrow(tdm.rejectProposal, [
        {
          from: owner
        }
      ])
    })

    it('should NOT allow divorce before married even if fiance', async () => {
      await testWillThrow(tdm.divorce, [
        {
          from: brideAddress,
          value: defaultDivorceFee
        }
      ])
    })

    it('should NOT allow changeWeddingPhoto before married', async () => {
      await testWillThrow(tdm.changeWeddingPhoto, [
        'http://lorempixel.com/640/480/people',
        {
          from: brideAddress
        }
      ])
    })

    it('should destroy the contract when one of the fiances runs rejectProposal', async () => {
      const preBrideAddress = await tdm.bride()
      const preGroomAddress = await tdm.groom()

      await tdm.rejectProposal.sendTransaction({
        from: groomAddress
      })
      const postBrideAddress = await tdm.bride()
      const postGroomAddress = await tdm.groom()
      const postMarried = await tdm.married()
      assert.equal(
        preBrideAddress,
        brideAddress,
        'the bride address should still be what was originally in the constructor'
      )
      assert.equal(
        preGroomAddress,
        groomAddress,
        'the groom address should still be what was originally in the constructor'
      )
      assert.equal(
        postBrideAddress,
        '0x0',
        'the postBrideAddress should be zeroed out'
      )
      assert.equal(
        postGroomAddress,
        '0x0',
        'the groomAddress should be zeroed out'
      )
      assert.equal(false, postMarried, 'married should be zeroed out')
    })
  })
})

describe('when starting a happy wedding', () => {
  contract('TraditionalWedding', accounts => {
    /* eslint-disable max-len */
    const brideAddress = accounts[1]
    const groomAddress = accounts[2]
    const brideName = 'Ella'
    const groomName = 'Bob'
    const brideVows =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam quam nunc, rutrum hendrerit odio eu, fermentum ultrices elit. Cras et dolor fringilla, blandit arcu id, fringilla mauris. Quisque imperdiet felis arcu, vel dapibus ipsum vulputate eget. Integer suscipit feugiat velit nec vulputate. Nam euismod enim nec orci facilisis faucibus. Morbi et leo a nibh suscipit cursus. Fusce quis tempus lacus, et consectetur turpis. Vivamus eu neque rhoncus, suscipit diam nec, pellentesque urna. Nullam aliquet, ipsum porta tincidunt facilisis, ipsum quam aliquet lectus, non egestas lacus sapien vitae nibh. Mauris consequat eget quam non ornare.'
    const groomVows =
      'Proin ut ultrices lectus. Duis sed commodo ligula. Sed fringilla metus et condimentum malesuada. Proin consectetur eros diam, ac sagittis ligula efficitur at. In nulla turpis, iaculis nec cursus posuere, luctus accumsan lacus. Ut in neque convallis, aliquam tellus sit amet, porttitor elit. Etiam efficitur ante quis lacus elementum, nec semper quam ultrices. Nunc congue lobortis libero non porta. Etiam ante leo, gravida non sem at, porta scelerisque libero. Nam consequat, nunc eget euismod dapibus, nibh ex maximus quam, a interdum diam augue sed ante. Praesent finibus tincidunt augue, vitae auctor dolor viverra ac. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur tincidunt rutrum risus, nec dignissim urna gravida at. Nunc pulvinar felis aliquet, accumsan dolor vitae, tristique odio.'

    let wdm
    let tdm
    /* eslint-enable max-len */
    before('setup contract/state', async () => {
      wdm = await WeddingManager.new()
      await wdm.startWedding.sendTransaction(
        brideAddress,
        brideName,
        brideVows,
        groomAddress,
        groomName,
        groomVows,
        {
          from: groomAddress,
          value: defaultMarriageFee
        }
      )
      const tdmAddress = await wdm.weddingOf(groomAddress)
      tdm = await TraditionalWedding.at(tdmAddress)
    })

    it('should allow fiances to run acceptProposal', async () => {
      const preGroomSaysYes = await tdm.groomSaysYes()
      const preMarried = await tdm.married()
      await tdm.acceptProposal.sendTransaction({
        from: groomAddress
      })
      const postGroomSaysYes = await tdm.groomSaysYes()
      const postMarried = await tdm.married()

      assert(
        !preGroomSaysYes,
        'groomSaysYes should be false before acceptProposal is called'
      )
      assert(
        postGroomSaysYes,
        'groomSaysYes should be true after acceptProposal is called'
      )
      assert(!preMarried, 'the test should start with married === false')
      assert(
        !postMarried,
        'married should still be false because brideSaysYes === false'
      )
    })

    it('should change to married after both fiances run acceptProposal', async () => {
      const preBrideSaysYes = await tdm.brideSaysYes()
      const preMarried = await tdm.married()
      await tdm.acceptProposal.sendTransaction({
        from: brideAddress
      })
      const postBrideSaysYes = await tdm.brideSaysYes()
      const postMarried = await tdm.married()

      assert(
        !preBrideSaysYes,
        'brideSaysYes should be false before acceptProposal is called'
      )
      assert(
        postBrideSaysYes,
        'brideSaysYes should be true after acceptProposal is called'
      )
      assert.equal(
        preMarried,
        false,
        'the wedding status should be 0 (pending) before both fiances call acceptProposal'
      )
      assert.equal(
        postMarried,
        true,
        'the wedding status should be 1 (pending) after both fiances call acceptProposal'
      )
    })
  })
})

describe('when happily married', async () => {
  contract('TraditionalWedding', accounts => {
    /* eslint-disable max-len */
    const owner = accounts[0]
    const brideAddress = accounts[1]
    const groomAddress = accounts[2]
    const brideName = 'Ella'
    const groomName = 'Bob'
    const brideVows =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam quam nunc, rutrum hendrerit odio eu, fermentum ultrices elit. Cras et dolor fringilla, blandit arcu id, fringilla mauris. Quisque imperdiet felis arcu, vel dapibus ipsum vulputate eget. Integer suscipit feugiat velit nec vulputate. Nam euismod enim nec orci facilisis faucibus. Morbi et leo a nibh suscipit cursus. Fusce quis tempus lacus, et consectetur turpis. Vivamus eu neque rhoncus, suscipit diam nec, pellentesque urna. Nullam aliquet, ipsum porta tincidunt facilisis, ipsum quam aliquet lectus, non egestas lacus sapien vitae nibh. Mauris consequat eget quam non ornare.'
    const groomVows =
      'Proin ut ultrices lectus. Duis sed commodo ligula. Sed fringilla metus et condimentum malesuada. Proin consectetur eros diam, ac sagittis ligula efficitur at. In nulla turpis, iaculis nec cursus posuere, luctus accumsan lacus. Ut in neque convallis, aliquam tellus sit amet, porttitor elit. Etiam efficitur ante quis lacus elementum, nec semper quam ultrices. Nunc congue lobortis libero non porta. Etiam ante leo, gravida non sem at, porta scelerisque libero. Nam consequat, nunc eget euismod dapibus, nibh ex maximus quam, a interdum diam augue sed ante. Praesent finibus tincidunt augue, vitae auctor dolor viverra ac. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur tincidunt rutrum risus, nec dignissim urna gravida at. Nunc pulvinar felis aliquet, accumsan dolor vitae, tristique odio.'

    let wdm
    let tdm
    /* eslint-enable max-len */
    before('setup contract/state', async () => {
      wdm = await WeddingManager.new()
      await wdm.startWedding.sendTransaction(
        brideAddress,
        brideName,
        brideVows,
        groomAddress,
        groomName,
        groomVows,
        {
          from: groomAddress,
          value: defaultMarriageFee
        }
      )
      const tdmAddress = await wdm.weddingOf(groomAddress)
      tdm = await TraditionalWedding.at(tdmAddress)
      await tdm.acceptProposal.sendTransaction({
        from: brideAddress
      })
      await tdm.acceptProposal.sendTransaction({
        from: groomAddress
      })
      const married = await tdm.married()
      assert(married, 'the fiances should be married at this point')
    })

    it('fiances should NOT be able to run acceptProposal after married, even as fiance', async () => {
      await testWillThrow(tdm.acceptProposal, [
        {
          from: brideAddress
        }
      ])
    })

    it('should NOT be able to run rejectProposal after married, even as fiance', async () => {
      await testWillThrow(tdm.rejectProposal, [
        {
          from: brideAddress
        }
      ])
    })

    it('should NOT divorce as NON fiance', async () => {
      await testWillThrow(tdm.divorce, [
        {
          from: owner
        }
      ])
    })

    it('should NOT changeWeddingPhoto if NOT fiance', async () => {
      await testWillThrow(tdm.changeWeddingPhoto, [
        'http://somesite.com/somepicture.jpg',
        {
          from: owner
        }
      ])
    })

    it('should changeWeddingPhoto if fiance', async () => {
      const weddingPhoto = 'http://somesite/anicepicture.jpg'
      const preWeddingPhoto = await tdm.weddingPhoto()
      await tdm.changeWeddingPhoto.sendTransaction(weddingPhoto, {
        from: brideAddress
      })
      const postWeddingPhoto = await tdm.weddingPhoto()
      assert(preWeddingPhoto === '', 'the weddingPhoto should start empty')
      assert(
        postWeddingPhoto === weddingPhoto,
        'the wedding photo should be that set in changeWeddingPhoto'
      )
    })
  })
})

describe('when unhappily married', async () => {
  contract('TraditionalWedding/WeddingManager', accounts => {
    /* eslint-disable max-len */
    const brideAddress = accounts[1]
    const groomAddress = accounts[2]
    const brideName = 'Ella'
    const groomName = 'Bob'
    const brideVows =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam quam nunc, rutrum hendrerit odio eu, fermentum ultrices elit. Cras et dolor fringilla, blandit arcu id, fringilla mauris. Quisque imperdiet felis arcu, vel dapibus ipsum vulputate eget. Integer suscipit feugiat velit nec vulputate. Nam euismod enim nec orci facilisis faucibus. Morbi et leo a nibh suscipit cursus. Fusce quis tempus lacus, et consectetur turpis. Vivamus eu neque rhoncus, suscipit diam nec, pellentesque urna. Nullam aliquet, ipsum porta tincidunt facilisis, ipsum quam aliquet lectus, non egestas lacus sapien vitae nibh. Mauris consequat eget quam non ornare.'
    const groomVows =
      'Proin ut ultrices lectus. Duis sed commodo ligula. Sed fringilla metus et condimentum malesuada. Proin consectetur eros diam, ac sagittis ligula efficitur at. In nulla turpis, iaculis nec cursus posuere, luctus accumsan lacus. Ut in neque convallis, aliquam tellus sit amet, porttitor elit. Etiam efficitur ante quis lacus elementum, nec semper quam ultrices. Nunc congue lobortis libero non porta. Etiam ante leo, gravida non sem at, porta scelerisque libero. Nam consequat, nunc eget euismod dapibus, nibh ex maximus quam, a interdum diam augue sed ante. Praesent finibus tincidunt augue, vitae auctor dolor viverra ac. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur tincidunt rutrum risus, nec dignissim urna gravida at. Nunc pulvinar felis aliquet, accumsan dolor vitae, tristique odio.'

    let wdm
    let tdm
    /* eslint-enable max-len */
    beforeEach('setup contract/state', async () => {
      wdm = await WeddingManager.new()
      await wdm.startWedding.sendTransaction(
        brideAddress,
        brideName,
        brideVows,
        groomAddress,
        groomName,
        groomVows,
        {
          from: groomAddress,
          value: defaultMarriageFee
        }
      )
      const tdmAddress = await wdm.weddingOf(groomAddress)
      tdm = await TraditionalWedding.at(tdmAddress)
      await tdm.acceptProposal.sendTransaction({
        from: brideAddress
      })
      await tdm.acceptProposal.sendTransaction({
        from: groomAddress
      })
      const married = await tdm.married()
      assert(married, 'the fiances should be married at this point')
    })

    it('should divorce if both pay half', async () => {
      const preWeddingManagerContractBalance = await getEtherBalance(
        web3,
        wdm.address
      )
      const preBrideBalance = await getEtherBalance(web3, brideAddress)
      const preGroomBalance = await getEtherBalance(web3, groomAddress)

      const preMarried = await tdm.married()
      const preContractBalance = await getEtherBalance(web3, tdm.address)

      const postGroomTx = await tdm.divorce.sendTransaction({
        from: groomAddress,
        gasPrice,
        value: defaultDivorceFee.div(2)
      })

      const postGroomTxInfo = await getTxInfo(web3, postGroomTx)
      const postGroomMarried = await tdm.married()
      const postGroomBalance = await getEtherBalance(web3, groomAddress)
      const postGroomContractBalance = await getEtherBalance(web3, tdm.address)
      const expectedPostGroomBalance = preGroomBalance
        .minus(defaultDivorceFee.div(2))
        .minus(gasPrice.mul(postGroomTxInfo.gasUsed))

      const postBrideTx = await tdm.divorce.sendTransaction({
        from: brideAddress,
        gasPrice,
        value: defaultDivorceFee.div(2)
      })

      const postBrideTxInfo = await getTxInfo(web3, postBrideTx)
      const postBrideMarried = await tdm.married()
      const postBrideBalance = await getEtherBalance(web3, brideAddress)
      // cannot get balance of postBrideContractBalance because contract selfdestructs here
      const postWeddingManagerContractBalance = await getEtherBalance(
        web3,
        wdm.address
      )
      const postBrideContractBalance = await getEtherBalance(web3, tdm.address)
      const expectedPostBrideBalance = preBrideBalance
        .minus(defaultDivorceFee.div(2))
        .minus(gasPrice.mul(postBrideTxInfo.gasUsed))

      assert(preMarried, 'this test should start married')
      assert.equal(
        postGroomBalance.toString(),
        expectedPostGroomBalance.toString(),
        'the groom balance should match expectedPostGroomBalance'
      )
      assert.equal(
        postGroomContractBalance.minus(preContractBalance).toString(),
        defaultDivorceFee.div(2).toString(),
        'the contract balance should match expectedPostGroomBalance'
      )
      assert(
        postGroomMarried,
        'married should still be true until other party divorces'
      )
      assert(
        !postBrideMarried,
        'married should be false after both have divorced'
      )
      assert.equal(
        postBrideBalance.toString(),
        expectedPostBrideBalance.toString(),
        'the bride balance should match expectedPostBrideBalance'
      )
      assert.equal(
        postWeddingManagerContractBalance
          .minus(preWeddingManagerContractBalance)
          .toString(),
        defaultDivorceFee.toString(),
        'the wedding manager contract balance should be incremented by defaultDivorceFee'
      )
      assert.equal(
        postBrideContractBalance.toString(),
        '0',
        'the contract balance should be 0 after selfdestructing'
      )
    })

    it('should divorce if one fiance pays all fees first', async () => {
      const preMarried = await tdm.married()
      const preWeddingManagerContractBalance = await getEtherBalance(
        web3,
        wdm.address
      )
      const preBrideBalance = await getEtherBalance(web3, brideAddress)
      const preWeddingContractBalance = await getEtherBalance(web3, tdm.address)

      const postBrideTx = await tdm.divorce.sendTransaction({
        from: brideAddress,
        value: defaultDivorceFee,
        gasPrice
      })

      const postBrideMarried = await tdm.married()

      const postBrideTxInfo = await getTxInfo(web3, postBrideTx)
      const postBrideBalance = await getEtherBalance(web3, brideAddress)
      const postWeddingContractBalance = await getEtherBalance(
        web3,
        tdm.address
      )
      const expectedPostBrideBalance = preBrideBalance
        .minus(defaultDivorceFee)
        .minus(gasPrice.mul(postBrideTxInfo.gasUsed))

      await tdm.divorce.sendTransaction({
        from: groomAddress,
        value: 0,
        gasPrice
      })

      const postGroomMarried = await tdm.married()

      const finalWeddingContractBalance = await getEtherBalance(
        web3,
        tdm.address
      )
      const postWeddingManagerContractBalance = await getEtherBalance(
        web3,
        wdm.address
      )

      assert(preMarried, 'should start test as married')
      assert(postBrideMarried, 'should still be married')
      assert.equal(
        postBrideBalance.toString(),
        expectedPostBrideBalance.toString(),
        'the balance should match expectedPostBrideBalance'
      )
      assert.equal(
        postWeddingContractBalance.minus(preWeddingContractBalance).toString(),
        defaultDivorceFee.toString(),
        'the wedding contract should be decremented by the defaultDivorceFee'
      )
      assert(
        !postGroomMarried,
        'married should now be false and the contract should be selfdestructed'
      )
      assert.equal(
        finalWeddingContractBalance.toString(),
        '0',
        'the wedding contract balance should be 0 after divorced and selfdestructed'
      )
      assert.equal(
        postWeddingManagerContractBalance
          .minus(preWeddingManagerContractBalance)
          .toString(),
        defaultDivorceFee.toString(),
        'the wedding manager contract balance should be incremented by the defaultDivorceFee'
      )
    })

    it('should divorce if one pays all fees last', async () => {
      const preMarried = await tdm.married()
      const preWeddingManagerContractBalance = await getEtherBalance(
        web3,
        wdm.address
      )
      const preGroomBalance = await getEtherBalance(web3, groomAddress)
      const preWeddingContractBalance = await getEtherBalance(web3, tdm.address)

      await tdm.divorce.sendTransaction({
        from: brideAddress,
        value: 0,
        gasPrice
      })

      const postBrideMarried = await tdm.married()

      const postGroomTx = await tdm.divorce.sendTransaction({
        from: groomAddress,
        value: defaultDivorceFee,
        gasPrice
      })

      const postGroomTxInfo = await getTxInfo(web3, postGroomTx)
      const postGroomBalance = await getEtherBalance(web3, groomAddress)
      const expectedPostGroomBalance = preGroomBalance
        .minus(defaultDivorceFee)
        .minus(gasPrice.mul(postGroomTxInfo.gasUsed))

      const postGroomMarried = await tdm.married()

      const finalWeddingContractBalance = await getEtherBalance(
        web3,
        tdm.address
      )
      const postWeddingManagerContractBalance = await getEtherBalance(
        web3,
        wdm.address
      )

      assert(preMarried, 'should start test as married')
      assert(postBrideMarried, 'should still be married')
      assert(
        preWeddingContractBalance.toString(),
        '0',
        'the wedding contract balance should start at 0'
      )
      assert.equal(
        postGroomBalance.toString(),
        expectedPostGroomBalance.toString(),
        'the balance should match expectedPostGroomBalance'
      )
      assert(
        !postGroomMarried,
        'married should now be false and the contract should be selfdestructed'
      )
      assert.equal(
        finalWeddingContractBalance.toString(),
        '0',
        'the wedding contract balance should be 0 after divorced and selfdestructed'
      )
      assert.equal(
        postWeddingManagerContractBalance
          .minus(preWeddingManagerContractBalance)
          .toString(),
        defaultDivorceFee.toString(),
        'the wedding manager contract balance should be incremented by the defaultDivorceFee'
      )
    })

    it('should divorce if forget to pay the fees then divorce again with values that meet fee in the end', async () => {
      const preMarried = await tdm.married()
      const preWeddingManagerContractBalance = await getEtherBalance(
        web3,
        wdm.address
      )
      const preWeddingContractBalance = await getEtherBalance(web3, tdm.address)

      await tdm.divorce.sendTransaction({
        from: brideAddress,
        value: 0,
        gasPrice
      })

      const postBrideMarried = await tdm.married()

      await tdm.divorce.sendTransaction({
        from: groomAddress,
        value: 0,
        gasPrice
      })

      const postGroomMarried = await tdm.married()

      const preGroomBalance = await getEtherBalance(web3, groomAddress)
      const preBrideBalance = await getEtherBalance(web3, brideAddress)

      const postBrideTx = await tdm.divorce.sendTransaction({
        from: brideAddress,
        value: defaultDivorceFee.div(2),
        gasPrice
      })

      const postBridePayMarried = await tdm.married()
      const postBrideTxInfo = await getTxInfo(web3, postBrideTx)
      const postBrideBalance = await getEtherBalance(web3, brideAddress)
      const expectedPostBrideBalance = preBrideBalance
        .minus(defaultDivorceFee.div(2))
        .minus(gasPrice.mul(postBrideTxInfo.gasUsed))

      const postGroomTx = await tdm.divorce.sendTransaction({
        from: groomAddress,
        value: defaultDivorceFee.div(2),
        gasPrice
      })

      const postGroomPayMarried = await tdm.married()
      const postGroomTxInfo = await getTxInfo(web3, postGroomTx)
      const postGroomBalance = await getEtherBalance(web3, groomAddress)
      const expectedPostGroomBalance = preGroomBalance
        .minus(defaultDivorceFee.div(2))
        .minus(gasPrice.mul(postGroomTxInfo.gasUsed))

      const finalWeddingContractBalance = await getEtherBalance(
        web3,
        tdm.address
      )
      const postWeddingManagerContractBalance = await getEtherBalance(
        web3,
        wdm.address
      )

      assert(preMarried, 'should start test as married')
      assert(postBrideMarried, 'should still be married')
      assert(postGroomMarried, 'should still be married')
      assert(postBridePayMarried, 'should still be married')
      assert(!postGroomPayMarried, 'should be divorced')
      assert(
        preWeddingContractBalance.toString(),
        '0',
        'the wedding contract balance should start at 0'
      )
      assert.equal(
        postGroomBalance.toString(),
        expectedPostGroomBalance.toString(),
        'the balance should match expectedPostGroomBalance'
      )
      assert.equal(
        postBrideBalance.toString(),
        expectedPostBrideBalance.toString(),
        'the balance should match expectedPostBrideBalance'
      )
      assert.equal(
        finalWeddingContractBalance.toString(),
        '0',
        'the wedding contract balance should be 0 after divorced and selfdestructed'
      )
      assert.equal(
        postWeddingManagerContractBalance
          .minus(preWeddingManagerContractBalance)
          .toString(),
        defaultDivorceFee.toString(),
        'the wedding manager contract balance should be incremented by the defaultDivorceFee'
      )
    })
  })
})
