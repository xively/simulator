'use strict'

const logger = require('winston')
const jsforce = require('jsforce')
const _ = require('lodash')
const config = require('../../config/server')

class Salesforce {
  /**
   * @param  {Object} options
   */
  constructor () {
    this.connection = new jsforce.Connection()

    if (!(config.salesforce.user && config.salesforce.pass && config.salesforce.token)) {
      this.loggedIn = Promise.reject('Environment variables are missing')
      return
    }

    this.loggedIn = this.connection.login(config.salesforce.user, `${config.salesforce.pass}${config.salesforce.token}`)
    logger.info('salesforce#connecting')
  }

  /**
   * @param {Array} assets
   */
  addAssets (assets) {
    assets = assets.map((a) => ({
      Name: a.product,
      SerialNumber: a.serial,
      [config.salesforce.deviceField]: a.deviceId,
      Contact: { xively__XI_End_User_ID__c: a.orgId }
    }))

    return this.loggedIn
      .then(() => this.connection.sobject('Asset').upsertBulk(assets, config.salesforce.deviceField))
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
  }

  /**
   * @param {Array} cases
   */
  addCases (cases) {
    cases = cases.map((c) => ({
      Subject: c.subject,
      Description: c.description,
      Contact: { xively__XI_End_User_ID__c: c.orgId },
      Asset: { [config.salesforce.deviceField]: c.deviceId },
      [config.salesforce.deviceField]: c.deviceId
    }))

    return this.loggedIn
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
  }

  /**
   * @param {Array} contacts
   */
  addContacts (contacts) {
    contacts = _.uniq(contacts.map((c) => ({
      Email: c.email,
      xively__XI_End_User_ID__c: c.orgId
    })))

    const chunksOfContacts = _.chunk(contacts, 10)

    return this.loggedIn
      .then(() => Promise.all(chunksOfContacts.map((chunk) => this.connection.sobject('Contact').upsert(chunk, 'xively__XI_End_User_ID__c'))))
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
  }

  /**
   * @param {String} id
   */
  retrieveContact (id) {
    return this.loggedIn
      .then(() => this.connection.sobject('Contact').retrieve(id))
  }

  /**
   * @return {Promise} user email as a promise
   */
  getUserEmail () {
    return this.loggedIn
      .then(() => this.connection.query(`SELECT Id, Email FROM User WHERE Id = '${this.connection.userInfo.id}'`))
      .then((result) => result.records[0].Email)
  }
}

module.exports = Salesforce
