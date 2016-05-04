'use strict'

// Load .env file into process.env
require('dotenv').config({ silent: true })

const logger = require('winston')
const config = require('../config/server')
const salesforce = require('./salesforce')
const app = require('./app')
const socket = require('./socket')
const orchestrator = require('./orchestrator')

const server = socket(app)

/*
  Orchestrator
 */
orchestrator.init(server, app)

/*
  Salesforce
 */

salesforce.integration()

/*
  Server
 */

// start http server
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
