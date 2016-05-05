'use strict'

// Load .env file into process.env
require('dotenv').config({ silent: true })

const logger = require('winston')

const config = require('../config/server')
const salesforce = require('./salesforce')
// const blueprint = require('./xively').blueprint
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
  Salesforce
 */
salesforce.integration()

// const createAccountUser = () => {
//   const salesforceUser = config.salesforce.user
//   const account = {
//     accountId: config.account.accountId
//   }
//
//   if (!salesforceUser) {
//     return blueprint.createAccountUsers([account])
//   }
//
//   return salesforce.getUserEmail().then((idmUserEmail) => {
//     Object.assign(account, {
//       createIdmUser: true,
//       idmUserEmail
//     })
//
//     return blueprint.createAccountUsers([account])
//   })
// }

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
