'use strict'

const http = require('http')
const logger = require('winston')
const _ = require('lodash')
const socketIO = require('socket.io')
const blueprint = require('../xively').blueprint
const salesforce = require('../salesforce')

/**
 * Configure socket.io connection.
 * @param  {express.Server} app   Express Server
 * @return {http.Server}          HTTP Server with socket.io
 */
module.exports = function configureSocket (app, devices, rules) {
  const server = http.createServer(app)
  const io = socketIO(server)

  let simulationRunning = false
  function stopSimulation () {
    logger.debug('socket.io#stopSimulation')
    simulationRunning = false
    devices.stopSimulation()
  }

  function updateData () {
    // update salesforce && rules engine
    const blueprintPromise = Promise.all([
      blueprint.getDevices(),
      blueprint.getEndUsers()
    ]).then((response) => ({
      devices: response[0],
      endUsers: response[1]
    }))

    blueprintPromise.then((response) => {
      rules.update(response.devices)
    })

    blueprintPromise.then((result) => {
      if (salesforce.done) {
        salesforce.done.then(() => {
          salesforce.addContacts(result.endUsers)
          salesforce.addAssets(result.devices)
        })
      }
    })
  }
  updateData()

  // handle `connection` event
  io.on('connection', (socket) => {
    logger.debug('socket.io#connection', socket.client.conn.remoteAddress)
    const deviceIds = new Set()

    // fetch devices from blueprint
    const updateDevices = devices.update()

    updateData()

    socket.on('error', (err) => {
      logger.error('socket.io#error', err)
    })

    socket.on('connectDevice', (data, cb) => {
      logger.debug('socket.io#connectDevice')

      updateDevices.then(() => {
        const deviceId = data.deviceId
        deviceIds.add(deviceId)
        const device = devices.getOne(deviceId)
        if (device) {
          device.connect(socket.id)
          _.isFunction(cb) && cb(null, { ok: device.ok, simulate: simulationRunning })
        }
      })
    })

    socket.on('update', (data) => {
      const deviceId = data.deviceId
      const device = devices.getOne(deviceId)
      if (device) {
        const name = data.name
        const value = data.value
        device.updateSensor(name, value)
      }
    })

    socket.on('startSimulation', (data) => {
      logger.debug('socket.io#startSimulation', data)
      const deviceId = data.deviceId

      updateDevices.then(() => {
        simulationRunning = true

        devices.startSimulation(deviceId, () => {
          socket.emit('stopSimulation')
          stopSimulation()
        })
      })
    })

    socket.on('stopSimulation', stopSimulation)

    socket.on('malfunction', (data) => {
      const device = devices.getOne(data.deviceId)
      if (device) {
        device.triggerMalfunction()
      }
    })

    socket.on('disconnectDevice', (data) => {
      logger.debug('socket.io#disconnectDevice')

      const deviceId = data.deviceId
      const device = devices.getOne(data.deviceId)
      if (device) {
        device.disconnect(socket.id)
      }
      deviceIds.delete(deviceId)
    })

    socket.on('disconnect', () => {
      logger.debug('socket.io#disconnected')

      deviceIds.forEach((deviceId) => {
        const device = devices.getOne(deviceId)
        if (device) {
          device.disconnect(socket.id)
        }
      })
      deviceIds.clear()
    })
  })

  return server
}
