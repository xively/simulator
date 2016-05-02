'use strict'

const logger = require('winston')
const request = require('request-promise')
const config = require('../../config/server')

class Blueprint {
  constructor () {
    this.jwt = request({
      url: `https://${config.account.idmHost}/api/v1/auth/login-user`,
      method: 'POST',
      headers: {
        AccessToken: config.account.appToken
      },
      json: {
        accountId: config.account.accountId,
        emailAddress: config.account.emailAddress,
        password: config.account.password
      }
    })
    .then((res) => res.jwt)
  }

  /**
   * Authorize with the IDM server and yield a new state object with a `jwt` property.
   * @return {String}
   */
  getJwt () {
    return this.jwt
  }

  create (options) {
    return this.jwt.then((jwt) => {
      const url = `https://${config.account.blueprintHost}/api/v1/${options.url}`
      const method = options.method || 'POST'
      const responseField = options.responseField
      const items = options.items

      return Promise.all(items.map((item) => {
        const json = Object.assign({ accountId: config.account.accountId }, item)
        return request({
          url,
          method,
          auth: { bearer: jwt },
          json
        }).then((response) => response[responseField])
      }))
    })
  }

  get (options) {
    return this.jwt.then((jwt) => {
      const url = `https://${config.account.blueprintHost}/api/v1/${options.url}`
      const responseField = options.responseField

      return request({
        url,
        method: 'GET',
        auth: { bearer: jwt },
        qs: { accountId: config.account.accountId, pageSize: 1000 },
        json: true
      }).then((response) => response[responseField].results)
    })
  }

  createOrganizationTemplates (organizationTemplates) {
    logger.info('Creating: organization templates')
    return this.create({
      url: 'organizations/templates',
      responseField: 'organizationTemplate',
      items: organizationTemplates
    })
  }

  createDeviceTemplates (deviceTemplates) {
    logger.info('Creating: device templates')
    return this.create({
      url: 'devices/templates',
      responseField: 'deviceTemplate',
      items: deviceTemplates
    })
  }

  createOrganizations (organizations) {
    logger.info('Creating: organizations')
    return this.create({
      url: 'organizations',
      responseField: 'organization',
      items: organizations
    })
  }

  createDevices (devices) {
    logger.info('Creating: devices')
    return this.create({
      url: 'devices',
      responseField: 'device',
      items: devices
    })
  }

  createDeviceFields (fields) {
    logger.info('Creating: device fields')
    return this.create({
      url: 'devices/custom-fields',
      responseField: 'deviceField',
      items: fields
    })
  }

  createChannelTemplates (channelTemplates) {
    logger.info('Creating: channel templates')
    return this.create({
      url: 'channels/templates',
      responseField: 'channelTemplate',
      items: channelTemplates
    })
  }

  createEndUserTemplates (endUserTemplates) {
    logger.info('Creating: end user templates')
    return this.create({
      url: 'end-users/templates',
      responseField: 'endUserTemplate',
      items: endUserTemplates
    })
  }

  createEndUser (endUser) {
    logger.info('Creating: end user')
    return this.create({
      url: 'end-users',
      responseField: 'endUser',
      items: endUser
    })
  }

  createMqttCredentials (entities) {
    logger.info('Creating: mqtt credentials')
    return this.create({
      url: 'access/mqtt-credentials',
      responseField: 'mqttCredential',
      items: entities
    })
  }

  createAccountUsers (accountUsers) {
    logger.info('Creating: account users')
    return this.create({
      url: 'account-users',
      responseField: 'accountUser',
      items: accountUsers
    })
  }

  getDevices () {
    logger.debug('Get: devices')
    return this.get({
      url: 'devices',
      responseField: 'devices'
    })
  }

  getDeviceTemplates () {
    logger.debug('Get: device templates')
    return this.get({
      url: 'devices/templates',
      responseField: 'deviceTemplates'
    })
  }
}

module.exports = Blueprint
