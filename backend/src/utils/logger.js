const fs = require('fs')
const path = require('path')
const winston = require('winston')

const logsDir = path.join(__dirname, '..', '..', 'logs')
fs.mkdirSync(logsDir, { recursive: true })

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
  ]
})

module.exports = logger
