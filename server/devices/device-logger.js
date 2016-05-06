'use strict'

const logger = require('winston')
const _ = require('lodash')
const mqtt = require('mqtt')
const config = require('../../config/server')

class DeviceLogger {
  constructor (device) {
    this.device = device
  }

  static getMqtt () {
    if (!DeviceLogger.fallbackMqtt) {
      logger.debug('DeviceLogger#getMqtt: create singleton')
      DeviceLogger.fallbackMqtt = mqtt.connect(`mqtts://${config.account.brokerHost}:${config.account.brokerPort}`, {
        username: config.account.brokerUser,
        password: config.account.brokerPassword,
        rejectUnauthorized: false
      })

      DeviceLogger.fallbackMqtt.on('error', (error) => logger.error('DeviceLogger#constructor error', error.message))
    }

    return DeviceLogger.fallbackMqtt
  }

  onBoot () {
    this.sendLog({
      level: 'informational',
      message: 'Device boot complete'
    })

    _.forEach(this.device.sensors, (options, name) => {
      if (options.deviceLog && options.deviceLog.connect) {
        this.sendLog(options.deviceLog.connect)
      }
    })
  }

  onFactoryReset () {
    this.sendLog({
      level: 'informational',
      message: 'Factory reset command received',
      details: 'Factory reset command received',
      tags: ['reset', 'received']
    })

    setTimeout(() => {
      this.sendLog({
        level: 'informational',
        message: 'Device is being reset',
        details: 'Device is being reset',
        tags: ['reset', 'resetting']
      })
    }, 1000)

    setTimeout(() => {
      this.sendLog({
        level: 'informational',
        message: 'Device recovered from error',
        details: 'Device recovered from error',
        tags: ['reset', 'recovery']
      })
    }, 2000)
  }

  onMalfunction () {
    this.sendLog({
      level: 'error',
      message: 'Sensor malfunction occured',
      details: 'Sensor malfunction occured',
      tags: ['malfunction']
    })
  }

  sendLog (log) {
    const logChannel = `xi/blue/v1/${this.device.accountId}/d/${this.device.id}/_log`

    const message = JSON.stringify({
      // required
      sourceId: this.device.id,
      sourceType: 'deviceId',
      accountId: this.device.accountId,
      message: log.message,
      // optional
      sourceTimestamp: Date.now().toString(),
      code: log.level === 'informational' ? 200 : 400,
      details: log.details || log.message,
      severity: log.level, // ['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'informational', 'debug', 'lifecycle']
      tags: log.tags || []
    })

    if (this.device.mqtt && this.device.mqtt.connected) {
      this.device.publishMqtt(logChannel, message)
      return
    }

    DeviceLogger.getMqtt().publish(logChannel, message)
  }
}

module.exports = DeviceLogger
