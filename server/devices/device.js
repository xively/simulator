'use strict'

const mqtt = require('mqtt')
const _ = require('lodash')
const logger = require('winston')
const blueprint = require('../xively').blueprint
const serverConfig = require('../../config/server')

const DeviceLogger = require('./device-logger')
const extensions = require('./device-extensions')

const DEFAULT_SENSOR_OPTIONS = { min: 0, max: 100, wiggle: true }
const GENERATE_SENSOR_VALUES_INTERVAL = 5000
const WIGGLE_PERCENTAGE = 0.05

class Device {
  constructor (data) {
    this.logger = new DeviceLogger(this)
    this.ok = true

    // add device sensors (name, options)
    this.sensors = new Map()

    // connected socket ids
    this.connections = new Set()

    this.update(data)
  }

  /**
   * Add new sensor
   * @param {String} name
   * @param {Object?} channel
   */
  addSensor (name, channel) {
    if (this.sensors.has(name)) {
      return
    }

    channel = channel || this.channels.find((ch) => ch.channel.endsWith(name))
    if (!channel) {
      logger.debug('Device#addSensor: channel cannot be found', name)
      return
    }

    const options = (this.config.sensors && this.config.sensors[name]) || DEFAULT_SENSOR_OPTIONS
    this.sensors.set(name, Object.assign(_.clone(options), channel))
  }

  /**
   * Update device data
   * Reinitalize
   * Fill sensors dinamically using the device channels
   * @param  {Object} data
   */
  update (data) {
    Object.assign(this, data)

    _.forEach(this.channels, (channel) => {
      const name = channel.channel.split('/').pop()

      // control and _log channels are not representing sensors
      if (name !== 'control' && name !== '_log') {
        this.addSensor(name, channel)
      }
    })
  }

  updateSensor (name, value) {
    let message
    if (_.isNaN(_.parseInt(value))) {
      message = value
    } else {
      message = `${Date.now()}, ${name}, ${value}, , \n`
    }
    this.handleMessage(message)
  }

  /**
   * Handle socket connection
   * @param  {String} socketId
   */
  connect (socketId) {
    logger.debug('Device#connect: socket connecting to device', this.id)

    if (!this.connections.size) {
      this.logger.onBoot()

      this.connectMqtt().then(() => {
        this.subscribeMqtt('control')
        this.startGeneratingSensorValues()
      })
    }
    this.connections.add(socketId)
  }

  /**
   *
   * @param  {[type]} socketId [description]
   * @return {[type]}          [description]
   */
  disconnect (socketId) {
    logger.debug('Device#disconnect: socket disconnecting from device', this.id)

    this.connections.delete(socketId)
    if (!this.connections.size) {
      this.stopGeneratingSensorValues()
      this.disconnectMqtt()
    }
  }

  /**
   * Open MQTT connection using the device credentials
   */
  connectMqtt () {
    if (this.mqtt && this.mqtt.connected) {
      return Promise.resolve()
    }

    return blueprint.createMqttCredentials([Object.assign(this, {
      entityId: this.id,
      entityType: 'device'
    })]).then((mqttCredentials) => {
      return new Promise((resolve, reject) => {
        const mqttCredential = mqttCredentials[0]

        const host = `mqtts://${serverConfig.account.brokerHost}:${serverConfig.account.brokerPort}`
        const options = {
          username: this.id,
          password: mqttCredential.secret,
          rejectUnauthorized: false
        }

        this.mqtt = mqtt.connect(host, options)

        this.mqtt.on('connect', () => {
          logger.debug('Device#connectMqtt: connected')
          resolve()
        })

        this.mqtt.on('error', (error) => {
          logger.error('Device#connectMqtt: error', error.message)
          reject()
        })

        this.mqtt.on('message', (channel, message) => {
          // we only need to handle messages on the `control` channel
          if (channel.endsWith('control')) {
            // message is a Buffer, convert it to a String
            message = message.toString()
            logger.silly('Device#mqtt: on message:', channel, message)

            this.handleMessage(message)
          }
        })
      })
    }).catch((error) => logger.error('Device#connectMqtt: error', error))
  }

  handleMessage (message) {
    let response
    try {
      // JSON
      const parsed = JSON.parse(message)
      response = this.handleJSON(parsed)
    } catch (err) {
      // CSV
      try {
        response = this.handleCSV(message)
      } catch (err) { /* ignore */ }
    }

    if (this.ok && response) {
      this.publishMqtt(response.channel, response.message)
    }
  }

  handleJSON (message) {
    if (message.command === 'factory-reset') {
      logger.info('Device#handleJSON: factory reset command received')
      this.factoryReset()
      return this.logger.onFactoryReset()
    }
    return extensions.handleJSON(this, message)
  }

  handleCSV (message) {
    const parts = message.split(',')
    const timeStamp = parts[0].trim()
    const name = parts[1].trim()
    const sensorValue = Number(parts[2])

    if (!this.sensors.has(name)) {
      this.addSensor(name)
    }
    const options = this.sensors.get(name)
    options.latestValue = sensorValue

    this.sensors.set(name, options)

    return {
      channel: options.channel,
      message: `${timeStamp}, ${name}, ${sensorValue}, , \n`
    }
  }

  /**
   * Disconnect MQTT connection
   */
  disconnectMqtt () {
    if (this.mqtt && this.mqtt.connected && !this.mqtt.disconnecting) {
      logger.debug('Device#disconnectMqtt')
      this.mqtt.end()
      this.mqtt.on('close', () => {
        logger.debug('Device#disconnectMqtt: closed')
        this.mqtt = null
      })
    }
  }

  /**
   * Subscribe to a channel
   * @param  {Object|String} channel
   */
  subscribeMqtt (channel) {
    if (!this.mqtt) {
      logger.error('Device#subscribeMqtt: device is not connected to MQTT')
      return
    }

    const ch = _.isObject(channel) ? channel : this.channels.find((ch) => ch.channel.endsWith(channel))
    if (!ch || !ch.channel) {
      logger.error('Device#subscribeMqtt: channel cannot be found', channel)
      return
    }

    this.mqtt.subscribe(ch.channel)
  }

  /**
   * Publish a message to MQTT
   * @param  {String} channel
   * @param  {String} message
   */
  publishMqtt (channel, message) {
    if (!this.mqtt) {
      logger.error('Device#subscribeMqtt: device is not connected to MQTT')
      return
    }

    logger.silly('DeviceSimulator#publishMqtt', channel, message)
    this.mqtt.publish(channel, message)
  }

  /**
   * Generate new sensor values
   */
  generateSensorValues (simulation) {
    this.sensors.forEach((options, name) => {
      let latestValue
      if (_.isNumber(options.latestValue)) {
        latestValue = options.latestValue
      } else {
        latestValue = _.isNumber(options.default) ? options.default : _.mean([options.min, options.max])
      }

      let newValue
      if (simulation && options.simulation) {
        try {
          newValue = options.simulation(latestValue, this.sensors)
        } catch (ex) {
          newValue = latestValue
        }
      } else if (options.rule) {
        try {
          newValue = options.rule(latestValue, this.sensors)
        } catch (ex) {
          newValue = latestValue
        }
      } else if (simulation && options.wiggle) {
        newValue = latestValue + _.random(WIGGLE_PERCENTAGE, true) * _.sample([-1, 1]) * (options.max - options.min)
      } else {
        newValue = latestValue
      }

      newValue = _.isNaN(newValue) ? latestValue : _.clamp(Math.round(newValue), options.min, options.max)
      options.latestValue = newValue

      this.sensors.set(name, options)

      const message = `${Date.now()}, ${name}, ${newValue}, , \n`
      this.publishMqtt(options.channel, message)
    })
  }

  /**
   * Start sensor value generation
   */
  startGeneratingSensorValues (interval) {
    this.generateSensorValues()
    this.interval = setInterval(this.generateSensorValues.bind(this), interval || GENERATE_SENSOR_VALUES_INTERVAL)
  }

  /**
   * Stop sensor value generation
   */
  stopGeneratingSensorValues () {
    clearInterval(this.interval)
  }

  simulationTick () {
    if (this.ok) {
      extensions.simulationTick(this)
      this.generateSensorValues(true)
    }
  }

  /**
   * Trigger sensor malfunction
   * Won't report sensor data until device is resetted
   */
  triggerMalfunction () {
    this.logger.onMalfunction()
    this.ok = false
    this.stopGeneratingSensorValues()
  }

  /**
   * Reset device
   */
  factoryReset () {
    this.logger.onFactoryReset()

    if (!this.ok) {
      this.ok = true
      if (this.mqtt && this.mqtt.connected) {
        this.startGeneratingSensorValues()
      }

      logger.info('Device#factoryReset')
    }
  }
}

module.exports = Device
