const { createMarriedWeddingWithClaimedGifts } = require('./weddingGenerator')

const creator = process.env.CREATOR || 0
const acceptor = process.env.ACCEPTOR || 1

createMarriedWeddingWithClaimedGifts(creator, acceptor)
