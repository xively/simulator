'use strict'

const _ = require('lodash')

const extensions = {
  handleJSON (device, message) {
    const command = message.command
    const value = message.option

    if (command === 'speed') {
      const fanOptions = device.sensors.get('fan')
      fanOptions.latestValue = {
        off: 0,
        low: 1,
        high: 2
      }[value]
      device.sensors.set('fan', fanOptions)
      device.logger.sendLog({
        level: 'informational',
        message: `Fan ${value}`
      })

      return {
        channel: fanOptions.channel,
        message: `${Date.now()}, 'fan', ${fanOptions.latestValue}, , \n`
      }
    }

    if (command === 'filter') {
      const filterOptions = device.sensors.get('filter')
      filterOptions.latestValue = value
      device.sensors.set('filter', filterOptions)

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
      device.logger.sendLog(log)

      return {
        channel: filterOptions.channel,
        message: `${Date.now()}, 'fan', ${value}, , \n`
      }
    }
  },

  simulationTick (device) {
    const event = _.random(10)

    switch (event) {
      case 1: // hight temp warning
        if (device.mqtt && device.mqtt.connected && device.ok && device.sensors.has('temp')) {
          // TODO set temp value?
          device.logger.sendLog({
            level: 'warning',
            message: 'High Temperature',
            details: '100 F'
          })
        }
        break
      case 2: // thermometer faliure
        if (device.mqtt && device.mqtt.connected && device.ok && device.sensors.has('temp')) {
          device.logger.sendLog({
            level: 'error',
            message: 'Thermometer failure',
            details: 'Failed to read from TMP36. Sensor not found.'
          })
        }
        break
      case 3: // malfunction
        if (device.mqtt && device.mqtt.connected && device.ok && device.sensors.has('fan')) {
          device.logger.sendLog({
            level: 'error',
            message: 'Fan overheated',
            details: 'Shutting down	Filter internal temperature over 150 F'
          })
          device.triggerMalfunction()
        }
        break
      case 4: // factory reset
        if (!((device.mqtt && device.mqtt.connected) || device.ok)) {
          device.factoryReset()
        }
        break
      case 5:
      case 6: // disconnect
        device.logger.sendLog({
          level: 'error',
          message: 'Network connection failed',
          details: 'Failed to initialize network connection. DNS lookup to concaria.broker.xively.com failed. SSID: HomeWifi'
        })
        device.disconnect(device.SIMULATION_LISTENER)
        break
      default: // connect
        device.connect(device.SIMULATION_LISTENER)
    }
  }
}

module.exports = extensions
