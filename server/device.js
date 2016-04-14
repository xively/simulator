'use strict'

const mqtt = require('mqtt')
const _ = require('lodash')
const logger = require('winston')
const serverConfig = require('../config/server')
const deviceConfigs = require('../config/devices')

class Device {
  constructor (firmware) {
    this.firmware = firmware

    this.INTERVAL = 5000
    this.SIMULATION_INTERVAL = 1000
    this.WIGGLE_PERCENTAGE = 0.05
    this.simulation = false

    this.sensors = new Map()
    if (deviceConfigs[this.firmware.template.name]) {
      _.each(deviceConfigs[this.firmware.template.name].sensors, (sensorSettings, sensorName) => {
        this.addSensor(sensorName, _.clone(sensorSettings))
      })
    }

    this.connections = new Set()
    this.channels = new Map()
    this.channels.set('_log', `xi/blue/v1/${this.firmware.accountId}/d/${this.firmware.deviceId}/_log`)
  }

  connect (socketId) {
    logger.debug('virtual device#connecting to device', this.firmware.deviceId)
    if (!this.connections.size) {
      logger.debug('virtual device#device connecting to mqtt', this.firmware.deviceId)
      this.connectMqtt()
      this.startInterval()
      this.subscribe('control')
    }
    this.connections.add(socketId)
  }

  disconnect (socketId) {
    logger.debug('virtual device#disconnecting from device', this.firmware.deviceId)

    this.connections.delete(socketId)
    if (!this.connections.size) {
      logger.debug('virtual device#device disconnecting from mqtt', this.firmware.deviceId)
      this.disconnectMqtt()
      this.stopInterval()
      this.unsubscribe('control')
    }
  }

  connectMqtt () {
    const host = `mqtts://${serverConfig.virtualdevice.mqtt.mqttBroker}:${serverConfig.virtualdevice.mqtt.mqttPort}`
    const options = {
      username: this.firmware.entityId,
      password: this.firmware.secret
    }

    this.mqtt = mqtt.connect(host, options)

    this.mqtt.on('connect', () => {
      logger.debug('virtual device#mqtt connection success')
    })
    this.mqtt.on('error', (error) => {
      logger.debug('virtual device#mqtt connection error', error)
    })
    this.mqtt.on('message', (topic, message) => {
      const channel = topic.split('/').pop()

      if (channel === 'control') {
        this.setSensorValue(message)
      }
    })
  }

  sendDeviceLog (log, severity) {
    const logChannel = this.channels.get('_log')
    const date = Date.now().toString()

    const message = {
      sourceTimestamp: date,
      sourceId: this.firmware.deviceId,
      accountId: this.firmware.accountId,
      code: severity === 'informational' ? 200 : 400,
      message: log.message,
      details: log.details || log.message,
      severity: severity,
      tags: log.tags || []
    }
    this.mqtt.publish(logChannel, JSON.stringify(message))
  }

  setSensorValue (message) {
    const parts = message.toString().split(',')
    const timeStamp = parts[0]
    const sensorName = parts[1]
    const sensorValue = Number(parts[2])

    if (!this.sensors.has(sensorName)) {
      this.addSensor(sensorName)
    }
    const sensorSettings = this.sensors.get(sensorName)
    sensorSettings.latestValue = sensorValue

    this.sensors.set(sensorName, sensorSettings)

    const mqttMessage = `${timeStamp}, ${sensorName}, ${sensorValue}, , \n`
    this.mqtt.publish(sensorSettings.topic, mqttMessage)
  }

  disconnectMqtt () {
    this.mqtt && this.mqtt.end()
  }

  subscribe (channelName) {
    const topic = `xi/blue/v1/${this.firmware.accountId}/d/${this.firmware.deviceId}/${channelName}`

    logger.debug('virtual device#device subscribing to topic', topic)

    this.channels.set(channelName, topic)
    this.mqtt.subscribe(topic)
  }

  unsubscribe (channelName) {
    const topic = this.channels.get(channelName)

    logger.debug('virtual device#device unsubscribing from topic', topic, 'channelName', channelName)

    this.mqtt && this.mqtt.unsubscribe(topic)
    this.channels.delete(channelName)
  }

  addSensor (sensorName, sensorSettings) {
    sensorSettings = sensorSettings || {}
    sensorSettings.topic = `xi/blue/v1/${this.firmware.accountId}/d/${this.firmware.deviceId}/${sensorName}`
    this.sensors.set(sensorName, sensorSettings)
  }

  wiggle (current, min, max) {
    // adds or subtracts 0-10% of full range to the current value
    return current + _.random(this.WIGGLE_PERCENTAGE, true) * _.sample([-1, 1]) * (max - min)
  }

  generateSensorValue (sensorSettings, sensorName) {
    let latestValue
    if (_.isNumber(sensorSettings.latestValue)) {
      latestValue = sensorSettings.latestValue
    } else {
      latestValue = _.isNumber(sensorSettings.default) ? sensorSettings.default : _.mean([sensorSettings.min, sensorSettings.max])
    }

    let newValue
    if (this.simulation && sensorSettings.simulation) {
      try {
        newValue = sensorSettings.simulation(latestValue, this.sensors)
      } catch (ex) {
        newValue = latestValue
      }
    } else if (sensorSettings.rule) {
      try {
        newValue = sensorSettings.rule(latestValue, this.sensors)
      } catch (ex) {
        newValue = latestValue
      }
    } else if (sensorSettings.wiggle) {
      newValue = this.wiggle(latestValue, sensorSettings.min, sensorSettings.max)
    } else {
      newValue = latestValue
    }

    newValue = _.isNaN(newValue) ? latestValue : _.clamp(Math.round(newValue), sensorSettings.min, sensorSettings.max)
    sensorSettings.latestValue = newValue

    this.sensors.set(sensorName, sensorSettings)

    const message = `${Date.now()}, ${sensorName}, ${newValue}, , \n`
    logger.silly('virtual device#sending sensor data', sensorSettings.topic, message)
    this.mqtt.publish(sensorSettings.topic, message)
  }

  generateSensorValues () {
    this.sensors.forEach((sensorSettings, sensorName) => {
      this.generateSensorValue(sensorSettings, sensorName)
    })
  }

  startSimulation () {
    if (!this.simulation) {
      this.simulation = true
      this.stopInterval()
      this.startInterval(this.SIMULATION_INTERVAL)
    }
  }

  stopSimulation () {
    if (this.simulation) {
      this.simulation = false
      this.stopInterval()
      this.startInterval()
    }
  }

  startInterval (interval) {
    this.generateSensorValues()
    this.interval = setInterval(() => this.generateSensorValues(), interval || this.INTERVAL)
  }

  stopInterval () {
    clearInterval(this.interval)
  }
}

module.exports = Device
