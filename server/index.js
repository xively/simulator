'use strict'

// Load .env file into process.env
require('dotenv').config({ silent: true })

const logger = require('winston')
const request = require('request-promise')
const config = require('../config/server')
const Salesforce = require('./salesforce')
const Blueprint = require('./blueprint')
const app = require('./app')
const socket = require('./socket')

const server = socket(app)

/*
  Salesforce
 */

try {
  const options = config.salesforce
  const salesforce = new Salesforce(options)
  salesforce.addContacts([{
    email: options.user,
    orgId: config.sample.orgId
  }])

  const emailAddress = config.account.emailAddress
  const accountId = config.account.accountId
  const password = config.account.password

  request({
    method: 'POST',
    url: 'https://id.demo.xively.com/api/v1/auth/login-user',
    form: {
      emailAddress,
      password,
      accountId
    },
    json: true
  })
  .then((body) => {
    const jwt = body.jwt
    return new Blueprint({
      url: 'https://blueprint.demo.xively.com/docs',
      key: `Bearer ${jwt}`
    })
  })
  .then((client) => {
    // client
    // TODO salesforce.addAssets()
  })
} catch (err) {
  logger.warn(`
    Skipping salesforce provisioning.
    To set up this application with Salesforce, follow the instructions in the README.
  `)
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
