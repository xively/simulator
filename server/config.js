
'use strict';

function Config(opts) {

  return {
    account: {
      idmHost: process.env.XIVELY_IDM_HOST,
      timeSeriesHost: process.env.XIVELY_TIMESERIES_HOST,
      brokerHost: process.env.XIVELY_BROKER_HOST,
      brokerPort: process.env.XIVELY_BROKER_WS_PORT,
      blueprintHost: process.env.XIVELY_BLUEPRINT_HOST,
      accountId: process.env.XIVELY_ACCOUNT_ID,
      emailAddress: process.env.XIVELY_ACCOUNT_USER_NAME,
      password: process.env.XIVELY_ACCOUNT_USER_PASSWORD,
      organizationId: opts.organization.id,
      airnow: {
        apikey: '640AA087-B3E7-4098-B3F3-9F8EF81C0BC7',
        boundingbox: '-71.059289,42.335449,-71.017232,42.365642'
      },
      user: {
        username: opts.endUser.id,
        password: opts.mqttUser.secret
      },
      device: {
        id: opts.device.id,
        accountId: opts.device.accountId,
        mqtt: {
          username: process.env.XIVELY_ACCOUNT_BROKER_USER,
          password: process.env.XIVELY_ACCOUNT_BROKER_PASSWORD
        },
        channelnamemap: {
          control: 'control',
          sensor: 'sensor',
          deviceinfo: 'device-log'
        }
      }
    },
    meta: {
      env: process.env.NODE_ENV
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
        mqttUseSSL: true,
        deviceId: opts.device.id
      }
    }
  };
}

module.exports = Config;