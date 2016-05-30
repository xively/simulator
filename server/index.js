'use strict'

// Load .env file into process.env
require('dotenv').config({ silent: true })

const logger = require('winston')

const config = require('../config/server')
const app = require('./app')
const socket = require('./socket')
const orchestrator = require('./orchestrator')
const devices = require('./devices')
const rules = require('./rules')

const server = socket(app, devices, rules)

/*
  Orchestrator
 */
orchestrator.init(server, app)

/*
  Server
 */
server.listen(config.server.port, (err) => {
  logger.info(`Server is listening on ${config.server.port}`)
  if (err) {
    throw err
  }
})

// graceful server shutdown
process.on('SIGTERM', () => {
  logger.debug('Received kill signal (SIGTERM), shutting down gracefully.')

  server.close(() => {
    logger.debug('Closed out remaining connections.')
    process.exit()
  })

  setTimeout(() => {
    logger.debug('Could not close connections in time.')
    process.exit(1)
  }, 30000)
})
