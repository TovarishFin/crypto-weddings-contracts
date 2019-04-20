const { setupContext } = require('../helpers/general')

describe('when using core WeddingManager functionality', () => {
  let context
  before('setup context', async () => {
    context = await setupContext()
  })
  it('context to be setup and expect to be global', () => {
    expect(true).to.equal(true)

    // eslint-disable-next-line
    console.log(context.owner.address)
  })
})
