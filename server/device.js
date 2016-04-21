'use strict'

const mqtt = require('mqtt')
const _ = require('lodash')
const logger = require('winston')
const serverConfig = require('../config/server')
const deviceConfigs = require('../config/devices')

class Device {
  constructor (firmware) {
    this.firmware = firmware

    this.INTERVAL = 500
    this.WIGGLE_PERCENTAGE = 0.05

    this.connected = false
    this.simulation = false
    this.ok = true

    this.connections = new Set()
    this.channels = new Map()
    this.channels.set('_log', `xi/blue/v1/${this.firmware.accountId}/d/${this.firmware.deviceId}/_log`)

    this.sensors = new Map()
    this.initSensors()
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

    this.sendDeviceLog({
      level: 'informational',
      message: 'Device boot complete'
    })

    _.each(deviceConfigs[this.firmware.template.name].sensors, (sensorSettings, sensorName) => {
      if (sensorSettings.deviceLog && sensorSettings.deviceLog.connect) {
        this.sendDeviceLog(sensorSettings.deviceLog.connect)
      }
    })
  }

  disconnect (socketId) {
    logger.debug('virtual device#disconnecting from device', this.firmware.deviceId)

    this.connections.delete(socketId)

    if (!this.connections.size && this.connected) {
      logger.debug('virtual device#device disconnecting from mqtt', this.firmware.deviceId)
      this.disconnectMqtt()
      this.stopInterval()
      this.unsubscribe('control')
    }
  }

  connectMqtt () {
    const host = `mqtts://${serverConfig.account.brokerHost}:${serverConfig.account.brokerPort}`
    const options = {
      username: this.firmware.entityId,
      password: this.firmware.secret
    }

    this.mqtt = mqtt.connect(host, options)
    this.connected = true

    this.mqtt.on('connect', () => {
      logger.debug('virtual device#mqtt connection success')
    })
    this.mqtt.on('error', (error) => {
      logger.debug('virtual device#mqtt connection error', error)
    })
    this.mqtt.on('message', (topic, message) => {
      const channel = topic.split('/').pop()

      if (channel === 'control') {
        this.parseMessage(message)
      }
    })
  }

  disconnectMqtt () {
    this.mqtt && this.mqtt.end()
    this.connected = false
  }

  parseMessage (message) {
    message = message.toString()
    let response

    try {
      const parsed = JSON.parse(message)
      response = this.handleJSON(parsed)
    } catch (ex) {
      response = this.handleCSV(message)
    }

    if (response) {
      this.mqtt.publish(response.topic, response.message)
    }
  }

  handleCSV (message) {
    const parts = message.split(',')
    const timeStamp = parts[0]
    const sensorName = parts[1]
    const sensorValue = Number(parts[2])

    if (!this.sensors.has(sensorName)) {
      this.addSensor(sensorName)
    }
    const sensorSettings = this.sensors.get(sensorName)
    sensorSettings.latestValue = sensorValue

    this.sensors.set(sensorName, sensorSettings)

    return {
      topic: sensorSettings.topic,
      message: `${timeStamp}, ${sensorName}, ${sensorValue}, , \n`
    }
  }

  handleJSON (message) {
    switch (message.command) {
      case 'speed':
        const fanValues = ['off', 'low', 'high']
        const fanSettings = this.sensors.get('fan')
        fanSettings.latestValue = fanValues.indexOf(message.option)
        this.sensors.set('fan', fanSettings)
        this.sendFanLog(message.option)

        return {
          topic: fanSettings.topic,
          message: `${Date.now()}, 'fan', ${fanValues.indexOf(message.option)}, , \n`
        }
      case 'factory-reset':
        this.factoryReset()
        return
      case 'filter':
        const filterSettings = this.sensors.get('filter')
        filterSettings.latestValue = message.option
        this.sensors.set('filter', filterSettings)
        this.sendFilterLog(message.option)

        return {
          topic: filterSettings.topic,
          message: `${Date.now()}, 'fan', ${message.option}, , \n`
        }
    }
  }

  sendDeviceLog (log) {
    const logChannel = this.channels.get('_log')
    const date = Date.now().toString()

    const message = {
      // required
      sourceId: this.firmware.deviceId,
      sourceType: 'deviceId',
      accountId: this.firmware.accountId,
      message: log.message,
      // optional
      sourceTimestamp: date,
      code: log.level === 'informational' ? 200 : 400,
      details: log.details || log.message,
      severity: log.level, // ['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'informational', 'debug', 'lifecycle']
      tags: log.tags || []
    }
    this.mqtt.publish(logChannel, JSON.stringify(message))
  }

  // TODO: handle this in a more generic way
  sendFanLog (value) {
    this.sendDeviceLog({
      level: 'informational',
      message: `Fan ${value}`
    })
  }

  sendFilterLog (value) {
    let log
    if (value === 1000) {
      log = {
        level: 'informational',
        message: 'Filter replaced',
        details: 'Authentic Concaria filter detected'
      }
    } else if (value === 0) {
      log = {
        level: 'error',
        message: 'Filter depleted',
        details: 'Filter is depleted'
      }
    } else if (value < 24) {
      log = {
        level: 'warning',
        message: 'Filter low',
        details: 'Filter low'
      }
    }
    this.sendDeviceLog(log)
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

  initSensors () {
    if (deviceConfigs[this.firmware.template.name]) {
      _.each(deviceConfigs[this.firmware.template.name].sensors, (sensorSettings, sensorName) => {
        this.addSensor(sensorName, _.clone(sensorSettings))
      })
    }
  }

  addSensor (sensorName, sensorSettings) {
    sensorSettings = sensorSettings || {}
    sensorSettings.topic = `xi/blue/v1/${this.firmware.accountId}/d/${this.firmware.deviceId}/${sensorName}`
    this.sensors.set(sensorName, sensorSettings)
  }

  generateSensorValues () {
    this.sensors.forEach((sensorSettings, sensorName) => {
      this.generateSensorValue(sensorSettings, sensorName)
    })
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

  wiggle (current, min, max) {
    return current + _.random(this.WIGGLE_PERCENTAGE, true) * _.sample([-1, 1]) * (max - min)
  }

  triggerThermometerFaliure () {
    this.sendDeviceLog({
      level: 'error',
      message: 'Thermometer failure',
      details: 'Failed to read from TMP36. Sensor not found.'
    })
  }

  triggerMalfunction () {
    this.sendDeviceLog({
      level: 'error',
      message: 'Sensor malfunction occured',
      details: 'Sensor malfunction occured',
      tags: ['malfunction']
    })
  }

  factoryReset () {
    this.sendDeviceLog({
      level: 'warning',
      message: 'Factory reset',
      details: 'Reset command received from remote'
    })
  }

  startSimulation (stopSimulationSignal) {
    this.simulationCounter = 0

    if (!this.simulation) {
      this.simulation = setInterval(() => {
        console.log('RUNNING', this.simulationCounter)
        const event = _.random(10)

        switch (event) {
          case 1: // hight temp warning
            if (this.connected && this.ok) {
              // this.sendDeviceLog({
              //   level: 'warning',
              //   message: 'High Temperature',
              //   details: '100 F'
              // })
            }
            break
          case 2: // malfunction
            if (this.connected && this.ok) {
              // this.sendDeviceLog({
              //   level: 'error',
              //   message: 'Fan overheated',
              //   details: 'Shutting down	Filter internal temperature over 150 F'
              // })
              // this.triggerMalfunction()
            }
            break
          case 3: // factory reset
            if (!this.connected && !this.ok) {
              // this.factoryReset()
            }
            break
          case 4:
          case 5: // disconnect
            // this.sendDeviceLog({
            //   level: 'error',
            //   message: 'Network connection failed',
            //   details: 'Failed to initialize network connection. DNS lookup to concaria.broker.xively.com failed. SSID: HomeWifi'
            // })
            if (this.connected) {
            }
            break
          default: // connect
            if (!this.connected) {

            }
        }

        if (this.simulationCounter++ === 5) {
          stopSimulationSignal()
        }
      }, this.INTERVAL)
    }
  }

  stopSimulation () {
    console.log('STOPPING')
    clearInterval(this.simulation)
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
