const _ = require('lodash')
const mqtt = require('mqtt')

/* @ngInject */
function mqttFactory ($log, $q, $rootScope, CONFIG, utils) {
  return new class MQTT {
    /**
     * Connect to Xively MQTT and subscribe event listeners
     */
    constructor () {
      this.channels = new Map()

      try {
        const host = `wss://${CONFIG.account.brokerHost}:${CONFIG.account.brokerPort}/mqtt`
        const options = {
          username: CONFIG.account.brokerUser,
          password: CONFIG.account.brokerPassword
        }
        $log.debug('MQTT#constructor open Xively client with options:', host, options)
        this.client = mqtt.connect(host, options)

        this.client.on('open', () => {
          $log.debug('MQTT#connection open')
        })
        this.client.on('message', (channel, message) => {
          this.handleMessage(channel, message.toString())
        })
        this.client.on('error', (error) => {
          $log.error('MQTT#connection error:', error)
        })
      } catch (error) {
        $log.error('MQTT#constructor error:', error)
        this.connected = $q.reject(error)
      }
    }

    /**
     * Parse MQTT message (JSON, CSV)
     * CSV format: timestamp, name, numeric value, string value
     * @param  {Object} message
     * @return {Object}
     */
    parseMessage (message = '', channel) {
      if (_.isObject(message)) {
        message = message.toString()
      }
      const channelName = channel ? channel.split('/').pop() : null

      // JSON format
      if (message.startsWith('{') || message.startsWith('[')) {
        try {
          return JSON.parse(message)
        } catch (e) { /* ignore */ }
      }

      // CSV format
      const csvRows = message.split('/n')
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

      // subscribe to channel
      if (!this.channels[channel]) {
        this.channels[channel] = new Set()
        $log.debug('MQTT#subscribe:', channel)
        this.client.subscribe(channel)
      }

      // add listener
      this.channels[channel].add(listener)

      // return unsubscribe function
      return this.unsubscribe.bind(this, channel, listener)
    }

    /**
     * Unsubscribe event listener
     * @param  {String} channel
     * @param  {Function} listener
     */
    unsubscribe (channel, listener) {
      if (this.channels[channel]) {
        // delete listener
        this.channels[channel].delete(listener)
        // unsubscribe from channel when noone is listening
        if (!this.channels[channel].size) {
          this.client.unsubscribe(channel)
          delete this.channels[channel]
        }
      }
    }

    /**
     * Send message to a given channel
     * @param  {String} channel
     * @param  {Object?} options
     */
    sendMessage (channel, payload = {}) {
      let message = payload
      if (_.isObject(payload)) {
        const {
          timestamp = Date.now(),
          name = channel.split('/').pop(),
          numericValue = 0,
          stringValue = ''
        } = payload
        message = [timestamp, name, numericValue, stringValue].join(',')
      }
      $log.debug('MQTT#sendMessage:', channel, message)
      this.client.publish(channel, message)
    }
  }
}

module.exports = mqttFactory
