'use strict'

const logger = require('winston')
const request = require('request-promise')
const config = require('../../config/server')

const idm = {
  login () {
    if (!this.jwt) {
      logger.debug('idm#login')
      this.jwt = request({
        url: `https://${config.account.idmHost}/api/v1/auth/login-user`,
        method: 'POST',
        headers: {
          AccessToken: config.account.appToken
        },
        json: {
          accountId: config.account.accountId,
          emailAddress: config.account.emailAddress,
          password: config.account.password
        }
      })
      .then((res) => res.jwt)
    }

    return this.jwt
  },

  logout () {
    this.jwt = null
  }
}

module.exports = idm
