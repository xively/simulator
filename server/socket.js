'use strict'

const http = require('http')
const logger = require('winston')
const socketIO = require('socket.io')
const _ = require('lodash')

const db = require('./database')

const Device = require('./device')
const devices = new Map()

let simulationRunning = false
function stopSimulation () {
  simulationRunning = false
  devices.forEach((device) => device.stopSimulation())
}

/**
 * Configure socket.io connection.
 * @param  {express.Server} app   Express Server
 * @return {http.Server}          HTTP Server with socket.io
 */
module.exports = function configureSocket (app) {
  const server = http.createServer(app)
  const io = socketIO(server)

  db.selectFirmwares()
    .then((firmwares) => {
      _.each(firmwares, (firmware) => {
        const device = new Device(firmware)
        devices.set(firmware.deviceId, device)
        logger.silly('socket.io#creating device', firmware.deviceId)
      })
    })

  // handle `connection` event
  io.on('connection', (socket) => {
    logger.debug('socket.io#connection from', socket.client.conn.remoteAddress)
    const deviceIds = new Set()

    socket.on('error', (err) => {
      logger.error('socket.io#error', err)
    })

    socket.on('connectDevice', (data, cb) => {
      logger.debug('socket.io#connectDevice')

      const deviceId = data.deviceId
      deviceIds.add(deviceId)
      const device = devices.get(deviceId)
      if (device) {
        device.connect(socket.id)
        cb(null, { ok: device.ok, simulate: simulationRunning })
      }
    })

    socket.on('startSimulation', (data) => {
      logger.debug('socket.io#start simulation', data)

      const thermometerFaliure = _.sample(devices.keys())
      simulationRunning = true

      devices.forEach((device, deviceId) => {
        if (deviceId !== data.deviceId) {
          device.startSimulation(() => {
            socket.emit('stopSimulation')
            stopSimulation()
          })
        }
        if (deviceId === thermometerFaliure) {
          device.triggerThermometerFaliure()
        }
      })
    })

    socket.on('stopSimulation', stopSimulation)

    socket.on('malfunction', (data) => {
      const device = devices.get(data.deviceId)
      if (device) {
        device.triggerMalfunction()
      }
    })

    socket.on('disconnectDevice', (data) => {
      logger.debug('socket.io#disconnectDevice')

      const deviceId = data.deviceId
      const device = devices.get(deviceId)
      if (device) {
        device.disconnect(socket.id)
      }
      deviceIds.delete(deviceId)
    })

    socket.on('disconnect', () => {
      logger.debug('socket.io#socket disconnected')

      deviceIds.forEach((deviceId) => {
        const device = devices.get(deviceId)
        if (device) {
          device.disconnect(socket.id)
        }
      })
      deviceIds.clear()
    })
  })

  return server
}
