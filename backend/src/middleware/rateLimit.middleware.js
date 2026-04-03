const rateLimit = require('express-rate-limit')
const { RedisStore } = require('rate-limit-redis')
const { createClient } = require('redis')

let redisClient
let redisStore
let productionMemoryStoreWarningShown = false

const getRedisStore = () => {
  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    if (process.env.NODE_ENV === 'production' && !productionMemoryStoreWarningShown) {
      productionMemoryStoreWarningShown = true
      console.warn('Warning: REDIS_URL not set - rate limiting is using the in-memory store and is not shared across instances')
    }

    return undefined
  }

  if (!redisClient) {
    redisClient = createClient({ url: redisUrl })
    redisClient.on('error', (error) => {
      console.error(`Redis rate limit store error: ${error.message}`)
    })
    redisClient.connect().catch((error) => {
      console.error(`Unable to connect Redis rate limit store: ${error.message}`)
    })
  }

  if (!redisStore) {
    redisStore = new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix: 'edunexus-rate-limit:'
    })
  }

  return redisStore
}

const createLimiter = ({ max, message }) => rateLimit({
  windowMs: 15 * 60 * 1000,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message },
  store: getRedisStore()
})

const apiLimiter = createLimiter({
  max: 300,
  message: 'Too many requests, please try again later'
})

const authLimiter = createLimiter({
  max: 20,
  message: 'Too many attempts, please try again later'
})

const uploadLimiter = createLimiter({
  max: 40,
  message: 'Too many upload attempts, please try again later'
})

const studentUploadLimiter = createLimiter({
  max: 15,
  message: 'Too many student upload attempts, please try again later'
})

const staffUploadLimiter = createLimiter({
  max: 25,
  message: 'Too many staff upload attempts, please try again later'
})

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  studentUploadLimiter,
  staffUploadLimiter
}
