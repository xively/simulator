'use strict'

const Swagger = require('swagger-client')

class Blueprint {
  constructor (options) {
    if (!(options && options.url && options.key)) {
      throw new TypeError('url and key are required options')
    }

    const url = options.url
    const key = options.key

    return new Swagger({
      url,
      usePromise: true
    }).then((client) => {
      client.clientAuthorizations.add('apiKey', new Swagger.ApiKeyAuthorization('authorization', key, 'header'))
      return client
    })
  }
}

module.exports = Blueprint
