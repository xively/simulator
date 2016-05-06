'use strict'

const mqtt = require('mqtt')
const _ = require('lodash')
const logger = require('winston')
const serverConfig = require('../../config/server')

const DeviceLogger = require('./device-logger')
const extensions = require('./device-extensions')

const DEFAULT_SENSOR_OPTIONS = { min: 0, max: 100, wiggle: true }
const INTERVAL = 5000
const WIGGLE_PERCENTAGE = 0.05
const SIMULATION_CICLES = 100
const SIMULATION_LISTENER = 'simulation'

class Device {
  constructor (data) {
    this.logger = new DeviceLogger(this)
    this.ok = true

    // add device sensors (name, options)
    this.sensors = new Map()

    // connected socket ids
    this.connections = new Set()

    this.update(data)

    this.SIMULATION_LISTENER = SIMULATION_LISTENER
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
    const options = this.sensors.get(name)
    if (options) {
      options.latestValue = value
      this.sensors.set(name, options)
      const message = `${Date.now()}, ${name}, ${value}, , \n`
      this.publishMqtt(options.channel, message)
    }
  }

  /**
   * Handle socket connection
   * @param  {String} socketId
   */
  connect (socketId) {
    logger.debug('Device#connect: socket connecting to device', this.id)

    if (!this.connections.size) {
      this.logger.onBoot()

      this.connectMqtt()
      this.subscribeMqtt('control')
      this.startGeneratingSensorValues()
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
      return
    }

    const host = `mqtts://${serverConfig.account.brokerHost}:${serverConfig.account.brokerPort}`
    const options = {
      username: this.id,
      password: this.secret,
      rejectUnauthorized: false
    }

    this.mqtt = mqtt.connect(host, options)

    this.mqtt.on('connect', () => logger.debug('Device#connectMqtt: connected'))
    this.mqtt.on('error', (error) => logger.error('Device#connectMqtt: error', error.message))
    this.mqtt.on('message', (channel, message) => {
      // we only need to handle messages on the `control` channel
      if (channel.endsWith('control')) {
        // message is a Buffer, convert it to a String
        message = message.toString()
        logger.silly('Device#mqtt: on message:', channel, message)

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
    })
  }

  handleJSON (message) {
    if (message.command === 'factory-reset') {
      logger.info('Device#handleJSON: factory reset command received')
      return this.logger.onFactoryReset()
    }
    return extensions.handleJSON(this, message)
  }

  handleCSV (message) {
    const parts = message.split(',')
    const timeStamp = parts[0]
    const name = parts[1]
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

    channel = _.isObject(channel) ? channel : this.channels.find((ch) => ch.channel.endsWith(channel))
    if (!channel || !channel.channel) {
      logger.error('Device#subscribeMqtt: channel cannot be found', channel)
      return
    }

    this.mqtt.subscribe(channel.channel)
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
  generateSensorValues () {
    this.sensors.forEach((options, name) => {
      let latestValue
      if (_.isNumber(options.latestValue)) {
        latestValue = options.latestValue
      } else {
        latestValue = _.isNumber(options.default) ? options.default : _.mean([options.min, options.max])
      }

      let newValue
      if (this.simulation && options.simulation) {
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
      } else if (this.simulation && options.wiggle) {
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
    this.interval = setInterval(this.generateSensorValues.bind(this), interval || INTERVAL)
  }

  /**
   * Stop sensor value generation
   */
  stopGeneratingSensorValues () {
    clearInterval(this.interval)
  }

  startSimulation (stopCallback) {
    this.simulationCounter = 0

    if (!this.simulation) {
      extensions.simulationTick(this)
      this.simulation = setInterval(() => {
        extensions.simulationTick(this)

        if (this.simulationCounter++ === SIMULATION_CICLES) {
          stopCallback()
        }
      }, INTERVAL)
    }
  }

  stopSimulation () {
    clearInterval(this.simulation)
    this.ok = true
    this.simulation = false

    this.disconnect(SIMULATION_LISTENER)
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
