'use strict'

const logger = require('winston')

const config = {
  logger: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info')
  },
  database: {
    pgUri: process.env.DATABASE_URL || 'postgres://localhost:5432/concaria'
  },
  server: {
    port: process.env.PORT || 5000,
    whitelist: [
      'http://www.airnowapi.org/aq/data',
      'https://timeseries.demo.xively.com/api/v4/data/xi/blue/v1',
      'http://concaria-sms.herokuapp.com/api'
    ]
  },
  blueprint: {
    url: process.env.BLUEPRINT_URL || 'https://blueprint.xively.com/docs'
  },
  salesforce: {
    user: process.env.SALESFORCE_USER,
    pass: process.env.SALESFORCE_PASSWORD,
    token: process.env.SALESFORCE_TOKEN
  },
  sample: {
    orgId: process.env.XIVELY_SAMPLE_ORG_ID
  },
  account: {
    idmHost: process.env.XIVELY_IDM_HOST,
    timeSeriesHost: process.env.XIVELY_TIMESERIES_HOST,
    brokerHost: process.env.XIVELY_BROKER_HOST,
    brokerPort: process.env.XIVELY_BROKER_WS_PORT,
    blueprintHost: process.env.XIVELY_BLUEPRINT_HOST,
    accountId: process.env.XIVELY_ACCOUNT_ID,
    emailAddress: process.env.XIVELY_ACCOUNT_USER_NAME,
    password: process.env.XIVELY_ACCOUNT_USER_PASSWORD,
    airnow: {
      apikey: '640AA087-B3E7-4098-B3F3-9F8EF81C0BC7',
      boundingbox: '-71.059289,42.335449,-71.017232,42.365642'
    },
    device: {
      mqtt: {
        username: process.env.XIVELY_ACCOUNT_BROKER_USER,
        password: process.env.XIVELY_ACCOUNT_BROKER_PASSWORD
      }
    }
  },
  meta: {
    env: process.env.NODE_ENV || 'development'
  },
  virtualdevice: {
    userInfo: {
      user: process.env.XIVELY_ACCOUNT_BROKER_USER,
      password: process.env.XIVELY_ACCOUNT_BROKER_PASSWORD
    },
    mqtt: {
      mqttBroker: process.env.XIVELY_BROKER_HOST,
      mqttPort: process.env.XIVELY_BROKER_PORT,
      mqttWsPort: process.env.XIVELY_BROKER_WS_PORT,
      mqttUseSSL: true
    }
  }
}

if (process.env.NODE_ENV !== 'test') {
  config.database.pgUri = `${config.database.pgUri}?ssl=true`
}

logger.default.transports.console.colorize = true
logger.level = config.logger.level

module.exports = config
