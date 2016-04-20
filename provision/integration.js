'use strict'

const logger = require('winston')
const jsforce = require('jsforce')
const request = require('request-promise')

function integration (jwt) {
  const user = process.env.SALESFORCE_USER
  const password = `${process.env.SALESFORCE_PASSWORD}${process.env.SALESFORCE_TOKEN}`

  if (!user) {
    return
  }

  return new jsforce.Connection().login(user, password)
    .then((result) => ({
      userId: result.id,
      organizationId: result.organizationId
    }))
    .then((salesforce) => {
      logger.info('Integrating with SalesForce')

      const removeAccount = () => request({
        url: `https://${process.env.XIVELY_INTEGRATION_HOST}/api/v1/accounts`,
        method: 'DELETE',
        auth: {
          bearer: jwt
        },
        json: {
          id: salesforce.organizationId
        }
      })

      const addAccount = () => request({
        url: `https://${process.env.XIVELY_INTEGRATION_HOST}/api/v1/accounts`,
        method: 'POST',
        auth: {
          bearer: jwt
        },
        json: {
          id: salesforce.organizationId,
          accountId: process.env.XIVELY_ACCOUNT_ID
        }
      })

      return removeAccount()
        .catch(() => addAccount())
        .then(() => addAccount())
    })
    .then(() => logger.info('Integrating with SalesForce success'))
    .catch((err) => {
      logger.error('Salesforce integration error:', JSON.stringify(err))
    })
}

module.exports = integration
