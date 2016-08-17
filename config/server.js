'use strict'

const logger = require('winston')

const config = {
  logger: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info')
  },
  database: {
    pgUri: process.env.DATABASE_URL || 'postgres://localhost:5432/concaria'
  },
  habanero: {
    embedded: process.env.HABANERO_EMBEDDED === 'true'
  },
  server: {
    port: process.env.PORT || 5000
  },
  blueprint: {
    url: process.env.BLUEPRINT_URL || 'https://blueprint.xively.com/docs'
  },
  smsService: {
    url: process.env.SMS_SERVICE_URL || 'https://concaria-sms.herokuapp.com/api/message'
  },
  salesforce: {
    username: process.env.SALESFORCE_USER,
    password: process.env.SALESFORCE_PASSWORD,
    token: process.env.SALESFORCE_TOKEN,
    namespace: process.env.SF_PKG_NAMESPACE || 'xively'
  },
  account: {
    idmHost: process.env.XIVELY_IDM_HOST || 'id.xively.com',
    integrationHost: process.env.XIVELY_INTEGRATION_HOST || 'integration.xively.com',
    timeSeriesHost: process.env.XIVELY_TIMESERIES_HOST || 'timeseries.xively.com',
    brokerHost: process.env.XIVELY_BROKER_HOST || 'broker.xively.com',
    brokerPort: process.env.XIVELY_BROKER_WS_PORT || 443,
    brokerUser: process.env.XIVELY_ACCOUNT_BROKER_USER,
    brokerPassword: process.env.XIVELY_ACCOUNT_BROKER_PASSWORD,
    blueprintHost: process.env.XIVELY_BLUEPRINT_HOST || 'blueprint.xively.com',
    accountId: process.env.XIVELY_ACCOUNT_ID,
    emailAddress: process.env.XIVELY_ACCOUNT_USER_NAME,
    idmUserId: process.env.XIVELY_ACCOUNT_USER_IDM_ID,
    blueprintUserId: process.env.XIVELY_ACCOUNT_USER_BP_ID,
    password: process.env.XIVELY_ACCOUNT_USER_PASSWORD,
    airnow: {
      apikey: '640AA087-B3E7-4098-B3F3-9F8EF81C0BC7',
      boundingbox: '-71.059289,42.335449,-71.017232,42.365642'
    }
  },
  virtualdevice: {
    heartbeat: process.env.DEVICE_HEARTBEAT === 'true'
  },
  meta: {
    env: process.env.NODE_ENV || 'development'
  }
}

if (process.env.NODE_ENV !== 'test') {
  config.database.pgUri = `${config.database.pgUri}?ssl=true`
}

logger.default.transports.console.colorize = true
logger.level = config.logger.level

module.exports = config
