const _ = require('lodash')
const socket = require('socket.io-client')

/* @ngInject */
function socketFactory ($q) {
  return new class Client {
    constructor () {
      this.client = socket('/')
      const deferred = $q.defer()
      this.connected = deferred.promise
      this.client.on('connect', () => {
        deferred.resolve()
      })
    }

    connect (device) {
      const deviceId = _.isString(device) ? device : device.id
      this.client.emit('connectDevice', { deviceId })
    }

    disconnect (device) {
      const deviceId = _.isString(device) ? device : device.id
      this.client.emit('disconnectDevice', { deviceId })
    }

    startSimulation (device) {
      const deviceId = _.isString(device) ? device : device.id
      this.client.emit('startSimulation', { deviceId })
    }

    stopSimulation (device) {
      const deviceId = _.isString(device) ? device : device.id
      this.client.emit('stopSimulation', { deviceId })
    }
  }
}

module.exports = socketFactory
