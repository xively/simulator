'use strict'

// Load .env file into process.env
require('dotenv').config({ silent: true })

const logger = require('winston')
const config = require('../config/server')
const salesforce = require('./salesforce')
const database = require('./database')
const app = require('./app')
const socket = require('./socket')
const orchestrator = require('../orchestrator')

require('./rules')

const server = socket(app)

/*
  Orchestrator
 */
orchestrator.init(server, app)

/*
  Salesforce
 */

try {
  database.selectApplicationConfig(config.account.accountId).then((appConfigs) => {
    const contacts = appConfigs.map((appConfig) => ({
      email: config.salesforce.user,
      orgId: appConfig.organization.id
    }))

    salesforce.addContacts(contacts)
  })

  database.selectFirmwares().then((firmwares) => {
    const devices = firmwares.map((firmware) => ({
      product: firmware.name,
      serial: firmware.serialNumber,
      deviceId: firmware.deviceId,
      orgId: firmware.organizationId
    }))

    salesforce.addAssets(devices)
  })
} catch (err) {
  logger.warn(`
    Skipping salesforce provisioning.
    To set up this application with Salesforce, follow the instructions in the README.
  `, err)
}

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
