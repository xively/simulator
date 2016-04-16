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
      return request({
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
    })
    .catch((err) => {
      logger.error('Salesforce integration error:', err)
      throw err
    })
}

module.exports = integration
