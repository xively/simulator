'use strict'

const logger = require('winston')
const jsforce = require('jsforce')
const _ = require('lodash')
const config = require('../../config/server')

const DEVICE_FIELD_NAME = `${config.salesforce.namespace}__XI_Device_ID__c`
const DEVICE_FIELD_NAME_WITHOUT_XI = `${config.salesforce.namespace}__Device_ID__c`
const END_USER_FIELD_NAME = `${config.salesforce.namespace}__XI_End_User_ID__c`

const salesforce = {
  login () {
    if (!this.loggedIn) {
      if (!(config.salesforce.user && config.salesforce.pass && config.salesforce.token)) {
        this.loggedIn = Promise.reject('Environment variables are missing')
      } else {
        this.connection = new jsforce.Connection()
        this.loggedIn = this.connection.login(config.salesforce.user, `${config.salesforce.pass}${config.salesforce.token}`)
      }

      this.loggedIn
        .then(() => logger.info('salesforce#login: success'))
        .catch((err) => logger.error('salesforce#login: error', err))
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
      .catch((err) => {
        logger.error('Salesforce #addAssets', err)
        throw new Error(err)
      })
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
      .catch((err) => {
        logger.error('Salesforce #addCases', err)
      })
  },

  /**
   * @param {Array} contacts
   */
  addContacts (contacts) {
    contacts = _.uniq(contacts.map((c) => ({
      Email: config.salesforce.user,
      [END_USER_FIELD_NAME]: c.organizationId
    })))

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
      .catch((err) => {
        logger.error('Salesforce #addContacts', err)
      })
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
  }
}

module.exports = salesforce
