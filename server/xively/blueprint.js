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
    logger.debug('Creating: organization templates')
    return this.create({
      url: 'organizations/templates',
      responseField: 'organizationTemplate',
      items: organizationTemplates
    })
  },

  createDeviceTemplates (deviceTemplates) {
    logger.debug('Creating: device templates')
    return this.create({
      url: 'devices/templates',
      responseField: 'deviceTemplate',
      items: deviceTemplates
    })
  },

  createOrganizations (organizations) {
    logger.debug('Creating: organizations')
    return this.create({
      url: 'organizations',
      responseField: 'organization',
      items: organizations
    })
  },

  createDevices (devices) {
    logger.debug('Creating: devices')
    return this.create({
      url: 'devices',
      responseField: 'device',
      items: devices
    })
  },

  createDeviceFields (fields) {
    logger.debug('Creating: device fields')
    return this.create({
      url: 'devices/custom-fields',
      responseField: 'deviceField',
      items: fields
    })
  },

  createChannelTemplates (channelTemplates) {
    logger.debug('Creating: channel templates')
    return this.create({
      url: 'channels/templates',
      responseField: 'channelTemplate',
      items: channelTemplates
    })
  },

  createEndUserTemplates (endUserTemplates) {
    logger.debug('Creating: end user templates')
    return this.create({
      url: 'end-users/templates',
      responseField: 'endUserTemplate',
      items: endUserTemplates
    })
  },

  createEndUser (endUser) {
    logger.debug('Creating: end user')
    return this.create({
      url: 'end-users',
      responseField: 'endUser',
      items: endUser
    })
  },

  createMqttCredentials (entities) {
    logger.debug('Creating: mqtt credentials')
    return this.create({
      url: 'access/mqtt-credentials',
      responseField: 'mqttCredential',
      items: entities
    })
  },

  createAccountUsers (accountUsers) {
    logger.debug('Creating: account users')
    return this.create({
      url: 'account-users',
      responseField: 'accountUser',
      items: accountUsers
    })
  },

  getDevices () {
    logger.debug('Blueprint#getDevices')
    return promiseDebounce(this.get.bind(this, {
      url: 'devices',
      responseField: 'devices'
    }), DEBOUNCE_WAIT)()
  },

  getDeviceTemplates () {
    logger.debug('Blueprint#getDeviceTemplates')
    return promiseDebounce(this.get.bind(this, {
      url: 'devices/templates',
      responseField: 'deviceTemplates'
    }), DEBOUNCE_WAIT)()
  },

  getEndUsers () {
    logger.debug('Blueprint#getEndUsers')
    return promiseDebounce(this.get.bind(this, {
      url: 'end-users',
      responseField: 'endUsers'
    }), DEBOUNCE_WAIT)()
  }
}

module.exports = blueprint
