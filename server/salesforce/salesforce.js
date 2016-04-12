'use strict'

const logger = require('winston')
const jsforce = require('jsforce')

class Salesforce {
  /**
   * @param  {Object} options
   */
  constructor (options) {
    if (!(options && options.user && options.password && options.token)) {
      throw new TypeError('Salesforce options are missing (user, password, token)')
    }

    const user = options.user
    const password = options.password
    const token = options.token

    this.connection = new jsforce.Connection()
    this.loggedIn = this.connection.login(user, `${password}${token}`)
  }

  /**
   * @param {Array} assets
   */
  addAssets (assets) {
    assets = assets.map((a) => ({
      Name: a.product,
      SerialNumber: a.serial,
      xively__Device_ID__c: a.deviceId,
      Contact: { xively__XI_End_User_ID__c: a.orgId }
    }))

    this.loggedIn
      .then(() => this.connection.sobject('Asset').upsertBulk(assets, 'xively__Device_ID__c'))
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
      Asset: { xively__Device_ID__c: c.deviceId },
      xively__XI_Device_ID__c: c.deviceId
    }))

    this.loggedIn
      .then(() => this.connection.sobject('Case').insert(cases))
      .then((results) => {
        results.forEach((result, idx) => {
          if (result.success) {
            logger.info('Salesforce #addCases', `inserted successfully: ${cases[idx].Subject}`)
          } else {
            throw result
          }
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
    contacts = contacts.map((c) => ({
      Email: c.email,
      xively__XI_End_User_ID__c: c.orgId
    }))

    this.loggedIn
      .then(() => this.connection.sobject('Contact').insert(contacts))
      .then((results) => {
        results.forEach((result, idx) => {
          if (result.success) {
            logger.info('Salesforce #addContacts', `inserted successfully: ${contacts[idx].Email}`)
          } else {
            throw result
          }
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
  };
}

module.exports = Salesforce
