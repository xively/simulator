'use strict'

const request = require('request-promise')
const config = require('../../config/server')
const idm = require('./idm')

const integration = {
  addAccount (organizationId) {
    return idm.login().then((jwt) => {
      request({
        url: `https://${config.account.integrationHost}/api/v1/accounts`,
        method: 'DELETE',
        auth: {
          bearer: jwt
        },
        json: {
          id: organizationId
        }
      })
    })
  },

  removeAccount (organizationId) {
    return idm.login().then((jwt) => {
      return request({
        url: `https://${config.account.integrationHost}/api/v1/accounts`,
        method: 'DELETE',
        auth: {
          bearer: jwt
        },
        json: {
          id: organizationId
        }
      })
    })
  }
}

module.exports = integration
