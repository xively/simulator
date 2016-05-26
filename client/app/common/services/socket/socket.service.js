const _ = require('lodash')
const socket = require('socket.io-client')

/* @ngInject */
function socketFactory ($q, $rootScope) {
  return new class Client {
    constructor () {
      this.client = socket('/')
      const deferred = $q.defer()
      this.connected = deferred.promise
      this.client.on('connect', () => {
        deferred.resolve()
      })

      this.deviceIds = new Set()
      this.client.on('reconnect', () => {
        this.reconnectDevices()
      })

      this.client.on('stopSimulation', () => $rootScope.$broadcast('stopSimulation'))
    }

    connect (device, cb) {
      const deviceId = _.isString(device) ? device : device.id
      this.deviceIds.add(deviceId)
      this.client.emit('connectDevice', { deviceId }, cb)
    }

    disconnect (device) {
      const deviceId = _.isString(device) ? device : device.id
      this.deviceIds.delete(deviceId)
      this.client.emit('disconnectDevice', { deviceId })
    }

    reconnectDevices () {
      this.deviceIds.forEach((deviceId) => this.connect(deviceId))
    }

    startSimulation (device) {
      const deviceId = _.isString(device) ? device : device.id
      this.client.emit('startSimulation', { deviceId })
    }

    stopSimulation (device) {
      const deviceId = _.isString(device) ? device : device.id
      this.client.emit('stopSimulation', { deviceId })
    }

    sendMessage (device, name, value) {
      const deviceId = _.isString(device) ? device : device.id
      if (!_.isObject(value)) {
        value = { value }
      }
      this.client.emit(name, Object.assign({ deviceId }, value))
    }
  }
}

module.exports = socketFactory
