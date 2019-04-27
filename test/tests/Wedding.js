const { setupContext } = require('../helpers/general')
const { testStartWedding } = require('../helpers/wmr')

describe.only('when creating a new wedding', () => {
  let context
  let wng
  let partner1
  let partner2
  const name1 = 'bob'
  const name2 = 'alice'

  before('setup context', async () => {
    context = await setupContext()
    partner1 = context.partner1
    partner2 = context.partner1
    wng = await testStartWedding(context, partner1, partner2, name1, name2, 1)
  })
})

describe('when using core Wedding functionality', () => {
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
