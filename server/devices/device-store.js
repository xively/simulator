'use strict'

const logger = require('winston')
const _ = require('lodash')
const blueprint = require('../xively').blueprint
const db = require('../database')
const Device = require('./device')

const SIMULATION_INTERVAL = 5000
const SIMULATION_CICLES = 100
const SIMULATION_LISTENER = 'simulation'

class DeviceStore {
  constructor () {
    // key: id, value: Device
    this.devices = new Map()
    // fill store
    this.update()
  }

  /**
   * Update device store
   * Refetch devices and templates from Blueprint
   * @return {Promise} ready
   */
  update () {
    if (!this.request) {
      this.request = Promise.all([
        blueprint.getDevices(),
        blueprint.getDeviceTemplates(),
        db.selectDeviceConfig()
          .then((data) => data[0].deviceConfig)
      ])
        .then((data) => {
          let devices = data[0]
          const deviceTemplates = data[1]
          const deviceConfig = data[2]

          devices = devices
            .map((device) => {
              device.template = _.find(deviceTemplates, { id: device.deviceTemplateId })
              device.config = deviceConfig[device.template.name] || {}
              device.SIMULATION_LISTENER = SIMULATION_LISTENER
              return device
            })
            .filter((device) => {
              const savedDevice = this.devices.get(device.id)
              if (savedDevice) {
                savedDevice.update(device)
                return false
              }
              return true
            })
            .map((device) => Object.assign(device, {
              entityId: device.id,
              entityType: 'device'
            }))

          if (devices.length) {
            return blueprint.createMqttCredentials(devices).then((mqttCredentials) => {
              devices.forEach((device) => {
                const mqttCredential = _.find(mqttCredentials, { entityId: device.id })
                Object.assign(device, mqttCredential)
                this.addDevice(device)
              })
            })
          } else {
            return Promise.resolve()
          }
        })
        .catch((error) => {
          this.request = null
          logger.error('DeviceStore#update', error)
        })
    }
    this.request.then(() => { this.request = null })
    return this.request
  }

  /**
   * Add new Device
   * @param {Object} device
   */
  addDevice (device) {
    const id = device.id
    if (!this.devices.has(id)) {
      logger.silly('DeviceStore#addDevice', id)
      this.devices.set(id, new Device(device))
    }
  }

  /**
   * Get all devices
   * @return {Map}
   */
  getAll () {
    return this.devices
  }

  /**
   * Get one device
   * @param  {String} id Device id
   * @return {Device}
   */
  getOne (id) {
    return this.devices.get(id)
  }

  /**
   * Simulation tick
   * @param  {String} deviceId Exclude from simulation
   */
  simulationTick (deviceId) {
    this.devices.forEach((device) => {
      if (device.id !== deviceId) {
        device.simulationTick()
      }
    })
  }

  /**
   * Start simulation
   * @param  {String} deviceId        Exclude from simulation
   * @param  {Function} stopCallback  Called on simulation stop
   */
  startSimulation (deviceId, stopCallback) {
    let simulationCounter = 0
    if (!this.simulation) {
      logger.debug('DeviceStore#startSimulation')
      this.simulationTick(deviceId)
      this.simulation = setInterval(() => {
        this.simulationTick(deviceId)
        simulationCounter += 1
        if (simulationCounter >= SIMULATION_CICLES) {
          stopCallback()
        }
      }, SIMULATION_INTERVAL)
    }
  }

  /**
   * Stop simulation
   */
  stopSimulation () {
    logger.debug('DeviceStore#stopSimulation')
    clearInterval(this.simulation)
    this.simulation = null
    this.devices.forEach((device) => {
      device.ok = true
      device.disconnect(SIMULATION_LISTENER)
    })
  }
}

module.exports = new DeviceStore()
