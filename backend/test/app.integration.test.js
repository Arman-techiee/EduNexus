const test = require('node:test')
const assert = require('node:assert/strict')
const request = require('supertest')

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/edunexus_test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret'
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret'
process.env.QR_SIGNING_SECRET = process.env.QR_SIGNING_SECRET || 'test-qr-secret'
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
process.env.NODE_ENV = process.env.NODE_ENV || 'test'

const { app } = require('../src/index')

test('GET /ping returns an ok response', async () => {
  const response = await request(app).get('/ping')

  assert.equal(response.status, 200)
  assert.deepEqual(response.body, { status: 'ok' })
})

test('unknown routes return a JSON 404 response', async () => {
  const response = await request(app).get('/definitely-not-a-route')

  assert.equal(response.status, 404)
  assert.deepEqual(response.body, { message: 'Route not found' })
})
