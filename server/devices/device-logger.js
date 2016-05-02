'use strict'

const _ = require('lodash')
const mqtt = require('mqtt')
const config = require('../../config/server')

const fallbackMqtt = mqtt.connect(`mqtts://${config.account.brokerHost}:${config.account.brokerPort}`, {
  username: config.account.brokerUser,
  password: config.account.brokerPassword
})

class DeviceLogger {
  constructor (device) {
    this.device = device
  }

  onBoot () {
    this.send({
      level: 'informational',
      message: 'Device boot complete'
    })

    _.forEach(this.device.sensors, (options, name) => {
      if (options.deviceLog && options.deviceLog.connect) {
        this.send(options.deviceLog.connect)
      }
    })
  }

  onFactoryReset () {
    this.send({
      level: 'informational',
      message: 'Factory reset command received',
      details: 'Factory reset command received',
      tags: ['reset', 'received']
    })

    setTimeout(() => {
      this.send({
        level: 'informational',
        message: 'Device is being reset',
        details: 'Device is being reset',
        tags: ['reset', 'resetting']
      })
    }, 1000)

    setTimeout(() => {
      this.send({
        level: 'informational',
        message: 'Device recovered from error',
        details: 'Device recovered from error',
        tags: ['reset', 'recovery']
      })
    }, 2000)
  }

  onMalfunction () {
    this.send({
      level: 'error',
      message: 'Sensor malfunction occured',
      details: 'Sensor malfunction occured',
      tags: ['malfunction']
    })
  }

  send (log) {
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

    fallbackMqtt.publish(logChannel, message)
  }
}

module.exports = DeviceLogger
