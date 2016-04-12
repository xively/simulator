const _ = require('lodash')
const xivelyClient = require('xively-client')

/* @ngInject */
function mqttFactory ($log, $q, $rootScope, CONFIG, utils) {
  return new class MQTT {
    /**
     * Connect to Xively MQTT and subscribe event listeners
     */
    constructor () {
      this.channels = new Map()

      try {
        const options = {
          host: CONFIG.account.brokerHost,
          port: Number(CONFIG.account.brokerPort),
          useSSL: true,
          user: CONFIG.account.user.username,
          pass: CONFIG.account.user.password,
          debug: CONFIG.meta && CONFIG.meta.env === 'development'
        }
        $log.debug('MQTT#constructor open Xively client with options:', options)
        this.client = xivelyClient.get(options)

        // extend connection handlers
        const deferred = $q.defer()
        this.connected = deferred.promise

        // save original handlers
        const _onConnectSuccess = this.client._onConnectSuccess.bind(this.client)
        const _handleFailedConnection = this.client._handleFailedConnection.bind(this.client)

        this.client._onConnectSuccess = () => {
          _onConnectSuccess()
          deferred.resolve(this.client)
        }

        this.client._handleFailedConnection = () => {
          _handleFailedConnection()
          deferred.reject()
        }

        // connect
        this.client.connect()
      } catch (err) {
        $log.error('MQTT#constructor error:', err)
        this.connected = $q.reject(err)
      }
    }

    /**
     * Parse MQTT message (JSON, CSV)
     * CSV format: timestamp, name, numeric value, string value
     * @param  {Object} message
     * @return {Object}
     */
    parseMessage (message, channel) {
      const payloadString = message && message.payloadString || ''
      const channelName = channel ? channel.split('/').pop() : null

      // JSON format
      try {
        const obj = JSON.parse(payloadString)
        if (_.isNumber(obj) && channelName) {
          return {
            [channelName]: {
              numericValue: obj
            }
          }
        }
        return obj
      } catch (e) { /* ignore */ }

      // CSV format
      const csvRows = payloadString.split('/n')
      return _.fromPairs(csvRows.map((row) => {
        const parts = row.split(',').map((string) => _.trim(string, '"').trim())
        let timestamp = utils.numberOrString(parts[0]) || Date.now()
        const name = parts[1]
        let numericValue = utils.numberOrString(parts[2])
        const stringValue = parts[3]

        // [key, value]
        return [channelName || name, _.omitBy({ timestamp, name, numericValue, stringValue }, _.isUndefined)]
      }))
    }

    /**
     * Emit message to subscribed event listeners
     * @param  {String} channel
     * @param  {Object} message
     */
    handleMessage (channel, message) {
      const parsedMessage = this.parseMessage(message, channel)
      $log.debug('MQTT#handleMessage:', channel, parsedMessage)
      $rootScope.$applyAsync(() => {
        this.channels[channel].forEach((listener) => listener(parsedMessage))
      })
    }

    /**
     * Subscribe event listener
     * @param  {String} channel
     * @param  {Function} listener
     * @return {Function} unsubscribe function
     */
    subscribe (channel, listener) {
      if (!channel || !listener) {
        throw new TypeError('MQTT#subscribe: missing arguments')
      }

      // wait for connection to be opened
      this.connected.then(() => {
        // subscribe to channel
        if (!this.channels[channel]) {
          this.channels[channel] = new Set()
          this.client.subscribe(channel, this.handleMessage.bind(this, channel))
        }

        // add listener
        this.channels[channel].add(listener)
      }, (err) => {
        $log.error('MQTT#subscribe:', err)
      })

      // return unsubscribe function
      return this.unsubscribe.bind(this, channel, listener)
    }

    /**
     * Unsubscribe event listener
     * @param  {String} channel
     * @param  {Function} listener
     */
    unsubscribe (channel, listener) {
      this.connected.then(() => {
        // delete listener
        this.channels[channel].delete(listener)
        // unsubscribe from channel when noone is listening
        if (this.channels[channel].size === 0) {
          this.client.unsubscribe(channel)
          delete this.channels[channel]
        }
      })
    }

    /**
     * Send message to a given channel
     * @param  {String} channel
     * @param  {Object?} options
     */
    sendMessage (channel, options = {}) {
      const {
        timestamp = Date.now(),
        name = channel.split('/').pop(),
        numericValue = 0,
        stringValue = ''
      } = options.payload || {}
      const payloadString = options.payloadString || [timestamp, name, numericValue, stringValue].join(',')
      this.connected.then(() => {
        this.client.send(channel, payloadString)
      })
    }
  }
}

module.exports = mqttFactory
