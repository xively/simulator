'use strict'

const BlueprintClient = require('../server/vendor/blueprint-client-node.js')
const request = require('request-promise')
const _ = require('lodash')

const blueprint = {

  /**
   * Used in testing provisioning via accounts.json file
   */
  useDemoAccount () {
    try {
      const account = require('../accounts')[0]
      console.log('Using accounts.json data %j', account)
      // Override env properties
      process.env.XIVELY_ACCOUNT_ID = account.accountId
      process.env.XIVELY_APP_ID = account.appId
      process.env.XIVELY_APP_TOKEN = account.appToken
      process.env.XIVELY_ACCOUNT_USER_NAME = account.username
      process.env.XIVELY_ACCOUNT_USER_PASSWORD = account.password
      process.env.XIVELY_IDM_HOST = 'id.demo.xively.com'
      process.env.XIVELY_BLUEPRINT_HOST = 'blueprint.demo.xively.com'
      process.env.XIVELY_BROKER_HOST = 'broker.demo.xively.com'
      process.env.XIVELY_TIMESERIES_HOST = 'timeseries.demo.xively.com'
    } catch (err) {
      // Fail silently
    }
  },

  /**
   * Authorize with the IDM server and yield a new state object with a `jwt` property.
   * @return {[type]}         [description]
   */
  getJwt (options) {
    return request({
      url: `https://${process.env.XIVELY_IDM_HOST}/api/v1/auth/login-user`,
      method: 'POST',
      headers: {
        AccessToken: process.env.XIVELY_APP_TOKEN
      },
      json: {
        accountId: process.env.XIVELY_ACCOUNT_ID,
        emailAddress: process.env.XIVELY_ACCOUNT_USER_NAME,
        password: process.env.XIVELY_ACCOUNT_USER_PASSWORD
      }
    })
    .then((res) => {
      const jwt = res.jwt
      return Object.assign({ jwt }, options)
    })
  },

  /**
   * Create a new Blueprint client and yield a new state object with a `client` property
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  getClient (options) {
    return new BlueprintClient({
      authorization: `Bearer ${options.jwt}`,
      docsUrl: `https://${process.env.XIVELY_BLUEPRINT_HOST}/docs`
    }).ready
    .then((client) => {
      return Object.assign({ client }, options)
    })
  },

  // Blueprint "create" method factory.
  //
  // Create a method to export:
  //   var createThing = blueprint.blueprintCreator(defaultOptions)
  //
  // Consume that method in a Blueprint promise chain:
  //
  // Use defaults:
  //   blueprintPromise.then(createThing()).then(...)
  //
  // Override defaults:
  //   blueprintPromise.then(createThing(overrideDefaults)).then(...)
  //
  // Override defaults programmatically, based on $:
  //   blueprintPromise.then(function($) {
  //     return createThing(overrideDefaults)($)
  //   }).then(...)
  blueprintCreator (baseOptions) {
    return (options) => {
      if (_.isFunction(options) || _.isArray(options)) {
        options = { body: options }
      }
      _.defaults(options, baseOptions)

      // The creator function.
      return ($) => {
        function create (optionsBody, current, total) {
          // Generate the POST body, augmenting via specified function or object.
          var body = {
            accountId: process.env.XIVELY_ACCOUNT_ID
          }
          if (_.isFunction(optionsBody)) {
            body = optionsBody(body, $) || body
          } else if (_.isObject(optionsBody)) {
            Object.assign(body, optionsBody)
          }
          // Error if specified method doesn't exist
          const apiMethod = $.client.apis[options.apiMethod]
          if (!apiMethod) {
            throw new Error('Blueprint method $.client.apis.' + options.apiMethod + ' not found')
          }

          // Create
          console.error('API %s.create %d/%d', options.apiMethod, current + 1, total)
          return apiMethod.create({
            body: JSON.stringify(body)
          }).then((res) => {
            if (options.responseProp in res.obj) {
              return res.obj[options.responseProp]
            }
            console.error('Response object:', res.obj)
            throw new Error(`Blueprint (${options.apiMethod}) response.obj.${options.responseProp} property missing`)
          })
          .catch((err) => {
            console.error('Request object:', JSON.stringify(body))
            throw err
          })
        }

        // Add creation response into specified property of result object.
        function normalize (value) {
          var prop = options.outputProp || options.responseProp
          console.error('Creating $.%s property', prop)
          return Object.assign({}, $, {
            [prop]: value
          })
        }
        // If options.body is an array, yield an array of responses.
        if (_.isArray(options.body)) {
          return Promise.all(options.body.map((body, idx) => {
            return create(body, idx, options.body.length)
          })).then(normalize)
        }
        // Otherwise yield a single response object.
        return create(options.body, 0, 1).then(normalize)
      }
    }
  },

  /**
   * Get all devices and yield a new state object with a "devices" property. Input
   * state object requires "env" and "client" properties.
   * @param  {[type]} $ [description]
   * @return {[type]}   [description]
   */
  getDevices (options) {
    return options.client.apis.devices.all({
      accountId: process.env.XIVELY_ACCOUNT_ID
    }).then((res) => {
      const devices = res.obj.devices.results
      return Object.assign({ devices }, options)
    })
  },

  /**
   * Get first device and yield a new state object with a "device" property. Input
   * state object requires "env" and "client" properties.
   * @param  {[type]} $ [description]
   * @return {[type]}   [description]
   */
  getDevice (options) {
    this.getDevices(options).then(function ($$) {
      const device = $$.devices[0]
      return Object.assign({ device }, options)
    })
  }
}
// Create and get channel templates and yield a new state object with a
// "channelTemplates" property added.
blueprint.createChannelTemplates = blueprint.blueprintCreator({
  apiMethod: 'channelsTemplates',
  responseProp: 'channelTemplate'
})

// Create and get a device template and yield a new state object with a
// "deviceTemplate" property added.
blueprint.createDeviceTemplate = blueprint.blueprintCreator({
  apiMethod: 'devicesTemplates',
  responseProp: 'deviceTemplate'
})

// Create and get device custom fields and yield a new state object with a
// "deviceField" property added.
blueprint.createDeviceFields = blueprint.blueprintCreator({
  apiMethod: 'devicesCustomFields',
  responseProp: 'deviceField'
})

// Create and get devices and yield a new state object with a "device" property
// added.
blueprint.createDevices = blueprint.blueprintCreator({
  apiMethod: 'devices',
  responseProp: 'device'
})

// Create and get a organization template and yield a new state object with an
// "organizationTemplate" property added.
blueprint.createOrganizationTemplate = blueprint.blueprintCreator({
  apiMethod: 'organizationsTemplates',
  responseProp: 'organizationTemplate'
})

// Create and get an organization and yield a new state object with an
// "organization" property added.
blueprint.createOrganization = blueprint.blueprintCreator({
  apiMethod: 'organizations',
  responseProp: 'organization'
})

// Create and get an end user template and yield a new state object with an
// "endUserTemplate" property added.
blueprint.createEndUserTemplate = blueprint.blueprintCreator({
  apiMethod: 'endUsersTemplates',
  responseProp: 'endUserTemplate'
})

// Create and get an end user and yield a new state object with an "endUser"
// property added.
blueprint.createEndUser = blueprint.blueprintCreator({
  apiMethod: 'endUsers',
  responseProp: 'endUser'
})

// Create and get device mqtt credentials and yield a new state object with an
// "mqtt" property added.
blueprint.createMqttCredentials = blueprint.blueprintCreator({
  apiMethod: 'accessMqttCredentials',
  responseProp: 'mqttCredential'
})

module.exports = blueprint
