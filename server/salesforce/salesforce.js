'use strict'

const logger = require('winston')
const jsforce = require('jsforce')
const _ = require('lodash')
const database = require('../database')
const config = require('../../config/server')
const xively = require('../xively')
const blueprint = xively.blueprint
const integration = xively.integration

const DEVICE_FIELD_NAME = `${config.salesforce.namespace}__XI_Device_ID__c`
const DEVICE_FIELD_NAME_WITHOUT_XI = `${config.salesforce.namespace}__Device_ID__c`
const END_USER_FIELD_NAME = `${config.salesforce.namespace}__XI_End_User_ID__c`

if (config.salesforce.username && config.salesforce.password && config.salesforce.token) {
  database.updateApplicationConfig({
    salesforceUsername: config.salesforce.username,
    salesforcePassword: config.salesforce.password,
    salesforceToken: config.salesforce.token
  })
} else {
  logger.info('Salesforce environment variables are missing')
}

const salesforce = {
  login () {
    if (!this.loggedIn) {
      this.loggedIn = database.selectApplicationConfig().then((applicationConfig) => {
        applicationConfig = applicationConfig || {}
        const username = applicationConfig.salesforceUsername
        const password = applicationConfig.salesforcePassword
        const token = applicationConfig.salesforceToken
        if (!(username && password && token)) {
          return Promise.reject('no salesforce credentials')
        }

        if (this.connection && this.connection.username === username) {
          return Promise.resolve()
        }
        this.connection = new jsforce.Connection()
        this.connection.username = username
        return this.connection.login(username, `${password}${token}`)
          .then((user) => {
            if (!user) {
              throw new Error('Could not log in')
            }
            return user
          })
      })

      this.loggedIn.catch((err) => {
        this.loggedIn = null
        logger.error(err)
      })
    }

    return this.loggedIn
  },

  /**
   * @param {Array} assets
   */
  addAssets (assets) {
    assets = assets.map((a) => ({
      Name: a.name || a.serialNumber,
      SerialNumber: a.serialNumber,
      [DEVICE_FIELD_NAME_WITHOUT_XI]: a.id || a.deviceId,
      Contact: { [END_USER_FIELD_NAME]: a.organizationId }
    }))

    return this.login()
      .then(() => this.connection.sobject('Asset').upsertBulk(assets, DEVICE_FIELD_NAME_WITHOUT_XI))
      .then((results) => {
        results.forEach((result, idx) => {
          if (result.success) {
            logger.info('Salesforce #addAssets', `inserted successfully: ${assets[idx].SerialNumber}`)
          } else {
            throw result
          }
        })
      })
      .catch((err) => logger.error(err))
  },

  /**
   * @param {Array} cases
   */
  addCases (cases) {
    cases = cases.map((c) => ({
      Subject: c.subject,
      Description: c.description,
      [DEVICE_FIELD_NAME]: c.id || c.deviceId
    }))

    return this.login()
      .then(() => this.connection.sobject('Case').insert(cases))
      .then((results) => {
        results.forEach((result, idx) => {
          if (!result.success) {
            throw result
          }
          logger.info('Salesforce #addCases', `inserted successfully: ${cases[idx].Subject}`)
        })
      })
      .catch((err) => logger.error(err))
  },

  /**
   * @param {Array} contacts
   */
  addContacts (contacts) {
    contacts = contacts.map((c) => ({
      Email: config.salesforce.user,
      Lastname: c.name,
      [END_USER_FIELD_NAME]: c.organizationId
    }))

    const chunksOfContacts = _.chunk(contacts, 10)

    return this.login()
      .then(() => Promise.all(chunksOfContacts.map((chunk) => this.connection.sobject('Contact').upsert(chunk, END_USER_FIELD_NAME))))
      .then((chunkOfResults) => _.flatten(chunkOfResults))
      .then((results) => {
        results.forEach((result, idx) => {
          if (!result.success) {
            throw result
          }
          logger.info('Salesforce #addContacts', `inserted successfully: ${JSON.stringify(contacts[idx])}`)
        })
      })
      .catch((err) => logger.error(err))
  },

  /**
   * @param {String} id
   */
  retrieveContact (id) {
    return this.login()
      .then(() => this.connection.sobject('Contact').retrieve(id))
  },

  /**
   * @return {Promise} user email as a promise
   */
  getUserEmail () {
    return this.login()
      .then(() => this.connection.query(`SELECT Id, Email FROM User WHERE Id = '${this.connection.userInfo.id}'`))
      .then((result) => result.records[0].Email)
  },

  integrate () {
    return this.getUserEmail()
      .then((idmUserEmail) => {
        return blueprint.createAccountUsers([{
          accountId: config.account.accountId,
          createIdmUser: true,
          idmUserEmail
        }])
      })
      .catch(() => {
        return blueprint.createAccountUsers([{
          accountId: config.account.accountId
        }])
      })
      .then(() => {
        return this.login()
          .then((user) => {
            return integration.removeAccount(user.organizationId)
              .catch(() => Promise.resolve())
              .then(() => integration.addAccount(user.organizationId))
          })
          .then(() => logger.info('Integrating with SalesForce success'))
      })
      .catch((err) => logger.error('Integrating with SalesForce:', err.message))
  }
}

module.exports = salesforce
