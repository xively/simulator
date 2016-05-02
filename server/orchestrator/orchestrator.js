'use strict'

const url = require('url')
const logger = require('winston')
const request = require('request-promise')
const habanero = require('node-red-habanero')
const habaneroSettings = require('node-red-habanero/settings')
const config = require('../../config/server')

const HABANERO_ADMIN_ROOT = '/orchestrator'
const HABANERO_NODE_ROOT = '/orchestrator-api'

function gotoHabanero (req, res) {
  const habaneroBaseUrl = `${req.protocol}://${req.get('origin') || req.get('host')}${HABANERO_ADMIN_ROOT}`
  request({
    uri: `${habaneroBaseUrl}/auth/token`,
    method: 'POST',
    form: {
      FROM_CONCARIA: 'true',
      client_id: 'node-red-editor',
      grant_type: 'password',
      scope: '',
      username: config.account.emailAddress,
      password: config.account.password,
      accountId: config.account.accountId,
      XIVELY_ACCOUNT_USER_IDM_ID: config.account.idmUserId,
      XIVELY_ACCOUNT_USER_BP_ID: config.account.blueprintUserId,
      SALESFORCE_USER: config.salesforce.user,
      SALESFORCE_PASSWORD: config.salesforce.pass,
      SALESFORCE_TOKEN: config.salesforce.token
    }
  }).then((loginResult) => {
    const ticket = new Buffer(loginResult).toString('base64')
    const loginUrl = url.format({
      pathname: 'enableSession',
      query: { ticket, adminRoot: HABANERO_ADMIN_ROOT }
    })
    res.redirect(`${habaneroBaseUrl}/${loginUrl}`)
  }).catch((error) => {
    logger.error('Error logging into orchestorator', error)
    res.status(500).send(error.response)
  })
}

const orchestrator = {
  HABANERO_ADMIN_ROOT,
  HABANERO_NODE_ROOT,
  init (server, app) {
    const disabled = !config.habanero.embedded || process.env.NODE_ENV === 'test'
    if (disabled) {
      return
    }

    habaneroSettings.httpAdminRoot = HABANERO_ADMIN_ROOT
    habaneroSettings.httpNodeRoot = HABANERO_NODE_ROOT
    habaneroSettings.verbose = true
    habanero.init(server, habaneroSettings)
    app.use(habaneroSettings.httpAdminRoot, habanero.httpAdmin)
    app.use(habaneroSettings.httpNodeRoot, habanero.httpNode)
    app.get('/goto-orchestrator', gotoHabanero)
    habanero.start()
  }
}

module.exports = orchestrator
