'use strict'

// Load .env file into process.env
require('dotenv').config({ silent: true })

const logger = require('winston')

const config = require('../config/server')
const salesforce = require('./salesforce')
const integration = require('./xively').integration
const blueprint = require('./xively').blueprint
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
  Salesforce integration
 */

// create account user
// integrating with salesforce
salesforce.done = salesforce.getUserEmail()
  .then((idmUserEmail) => {
    return blueprint.createAccountUsers([{
      accountId: config.account.accountId,
      createIdmUser: true,
      idmUserEmail
    }])
  })
  .catch(() => {
    return blueprint.createAccountUsers([{
      accountId: config.account.accountId
    }])
  })
  .then(() => {
    return salesforce.login()
      .then((user) => {
        return integration.removeAccount(user.organizationId)
          .catch(() => Promise.resolve())
          .then(() => integration.addAccount(user.organizationId))
      })
      .then(() => logger.info('Integrating with SalesForce success'))
  })
  .catch((err) => logger.error('Integrating with SalesForce error', err))

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
