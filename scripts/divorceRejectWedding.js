const { divorceRejectWedding } = require('./weddingGenerator')

const breaker = process.env.BREAKER || 0

divorceRejectWedding(breaker)
