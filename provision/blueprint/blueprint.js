'use strict'

const logger = require('winston')
const request = require('request-promise')

class Blueprint {
  constructor () {
    this.idmHost = process.env.XIVELY_IDM_HOST
    this.host = process.env.XIVELY_BLUEPRINT_HOST
    this.accountId = process.env.XIVELY_ACCOUNT_ID
    this.appToken = process.env.XIVELY_APP_TOKEN
    this.user = process.env.XIVELY_ACCOUNT_USER_NAME
    this.password = process.env.XIVELY_ACCOUNT_USER_PASSWORD
    this.salesforce = {
      user: process.env.SALESFORCE_USER
    }

    this.jwt = request({
      url: `https://${this.idmHost}/api/v1/auth/login-user`,
      method: 'POST',
      headers: {
        AccessToken: this.appToken
      },
      json: {
        accountId: this.accountId,
        emailAddress: this.user,
        password: this.password
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
      const url = `https://${this.host}/api/v1/${options.url}`
      const method = options.method || 'POST'
      const responseField = options.responseField
      const items = options.items

      return Promise.all(items.map((item) => {
        const json = Object.assign({ accountId: this.accountId }, item)
        return request({
          url,
          method,
          auth: { bearer: jwt },
          json
        }).then((response) => response[responseField])
      }))
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

  createAccountUser () {
    logger.info('Creating: account user')
    const item = {
      accountId: this.accountId
    }
    if (this.salesforce.user) {
      Object.assign(item, {
        createIdmUser: true,
        idmUserEmail: this.salesforce.user
      })
    }
    return this.create({
      url: 'account-users',
      responseField: 'accountUser',
      items: [item]
    })
  }
}

module.exports = Blueprint
