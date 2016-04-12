'use strict'

const http = require('http')
const logger = require('winston')
const socketIO = require('socket.io')

const db = require('./database')

const Device = require('./device')
const devices = new Map()

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
      firmwares.forEach((firmware) => {
        const device = new Device(firmware)
        devices.set(firmware.deviceId, device)
        logger.debug('creating device', firmware.deviceId)
      })
    })

  // handle `connection` event
  io.on('connection', (socket) => {
    logger.debug('socket.io: connection from', socket.client.conn.remoteAddress)
    const deviceIds = new Set()

    socket.on('connectDevice', (data) => {
      const deviceId = data.deviceId
      deviceIds.add(deviceId)
      const device = devices.get(deviceId)
      if (device) {
        device.connect(socket.id)
      }
    })

    socket.on('startSimulation', (data) => {
      const device = devices.get(data.deviceId)
      if (device) {
        device.startSimulation()
      }
    })

    socket.on('stopSimulation', (data) => {
      const device = devices.get(data.deviceId)
      if (device) {
        device.stopSimulation()
      }
    })

    socket.on('disconnectDevice', (data) => {
      const deviceId = data.deviceId
      const device = devices.get(deviceId)
      if (device) {
        device.disconnect(socket.id)
      }
      deviceIds.delete(deviceId)
    })

    socket.on('disconnect', () => {
      logger.debug('socket.io: socket disconnected')
      deviceIds.forEach((_, deviceId) => {
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
