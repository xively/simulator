'use strict'

const logger = require('winston')
const request = require('request-promise')
const promiseDebounce = require('../util').promiseDebounce
const config = require('../../config/server')
const idm = require('./idm')

const DEBOUNCE_WAIT = 100

const blueprint = {
  create (options) {
    return idm.login()
      .then((jwt) => {
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
      .catch((err) => {
        idm.logout()
        throw err
      })
  },

  get (options) {
    return idm.login()
      .then((jwt) => {
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
      .catch((err) => {
        idm.logout()
        throw err
      })
  },

  createOrganizationTemplates (organizationTemplates) {
    logger.debug('blueprint#createOrganizationTemplates')
    return this.create({
      url: 'organizations/templates',
      responseField: 'organizationTemplate',
      items: organizationTemplates
    })
  },

  createDeviceTemplates (deviceTemplates) {
    logger.debug('blueprint#createDeviceTemplates')
    return this.create({
      url: 'devices/templates',
      responseField: 'deviceTemplate',
      items: deviceTemplates
    })
  },

  createOrganizations (organizations) {
    logger.debug('blueprint#createOrganizations')
    return this.create({
      url: 'organizations',
      responseField: 'organization',
      items: organizations
    })
  },

  createDevices (devices) {
    logger.debug('blueprint#createDevices')
    return this.create({
      url: 'devices',
      responseField: 'device',
      items: devices
    })
  },

  createDeviceFields (fields) {
    logger.debug('blueprint#createDeviceFields')
    return this.create({
      url: 'devices/custom-fields',
      responseField: 'deviceField',
      items: fields
    })
  },

  createChannelTemplates (channelTemplates) {
    logger.debug('blueprint#createChannelTemplates')
    return this.create({
      url: 'channels/templates',
      responseField: 'channelTemplate',
      items: channelTemplates
    })
  },

  createEndUserTemplates (endUserTemplates) {
    logger.debug('blueprint#createEndUserTemplates')
    return this.create({
      url: 'end-users/templates',
      responseField: 'endUserTemplate',
      items: endUserTemplates
    })
  },

  createEndUser (endUser) {
    logger.debug('blueprint#createEndUser')
    return this.create({
      url: 'end-users',
      responseField: 'endUser',
      items: endUser
    })
  },

  createMqttCredentials (entities) {
    logger.debug('blueprint#createMqttCredentials')
    return this.create({
      url: 'access/mqtt-credentials',
      responseField: 'mqttCredential',
      items: entities
    })
  },

  createAccountUsers (accountUsers) {
    logger.debug('blueprint#createAccountUsers')
    return this.create({
      url: 'account-users',
      responseField: 'accountUser',
      items: accountUsers
    })
  },

  getDevices () {
    logger.debug('blueprint#getDevices')
    return promiseDebounce(this.get.bind(this, {
      url: 'devices',
      responseField: 'devices'
    }), DEBOUNCE_WAIT)()
  },

  getDeviceTemplates () {
    logger.debug('blueprint#getDeviceTemplates')
    return promiseDebounce(this.get.bind(this, {
      url: 'devices/templates',
      responseField: 'deviceTemplates'
    }), DEBOUNCE_WAIT)()
  },

  getEndUsers () {
    logger.debug('blueprint#getEndUsers')
    return promiseDebounce(this.get.bind(this, {
      url: 'end-users',
      responseField: 'endUsers'
    }), DEBOUNCE_WAIT)()
  }
}

module.exports = blueprint
