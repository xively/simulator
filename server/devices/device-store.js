'use strict'

const logger = require('winston')
const _ = require('lodash')
const uuid = require('uuid')
const blueprint = require('../xively').blueprint
const db = require('../database')
const provisionConfig = require('../../config/provision')
const Device = require('./device')

const SIMULATION_INTERVAL = 500
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
              const template = _.find(deviceTemplates, { id: device.deviceTemplateId })
              return Object.assign(device, {
                template,
                config: deviceConfig[template.name] || {},
                SIMULATION_LISTENER: SIMULATION_LISTENER
              })
            })
            .filter((device) => {
              const savedDevice = this.devices.get(device.id)
              if (savedDevice) {
                savedDevice.update(device)
                return false
              }
              return true
            })
            .forEach((device) => this.addDevice(device))
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
    // TODO refactor, device specific: trigger thermometer faliure on one device
    // const faliureDevice = _.find(this.devices, (device) => _.isFunction(device.triggerThermometerFaliure))
    // if (faliureDevice) {
      // faliureDevice.triggerThermometerFaliure()
    // }

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

        // spawn new devices
        if (_.random(5) === 0) {
          console.log('spawn devices')
          const rawDevice = _.sample(provisionConfig.rawDevices)
          const serialNumber = uuid.v4()
          const newDevice = rawDevice.generate({
            serialNumber,
            idx: serialNumber,
            deviceTemplate: rawDevice.name
          })
          const deviceWithMatchingTemplate = _.find(Array.from(this.devices.values()), (device) => device.template.name === newDevice.deviceTemplate)
          if (!deviceWithMatchingTemplate) {
            return
          }

          newDevice.deviceTemplateId = deviceWithMatchingTemplate.template.id
          newDevice.organizationId = deviceWithMatchingTemplate.organizationId
          Promise.all([
            blueprint.createDevices([newDevice]),
            db.selectDeviceConfig()
              .then((data) => data[0].deviceConfig)
          ])
          .then((data) => {
            const response = data[0]
            const deviceConfig = data[1]
            if (response.error) {
              throw new Error(response.error)
            }

            const device = new Device(Object.assign(response[0], {
              template: deviceWithMatchingTemplate.template,
              config: deviceConfig[device.template.name] || {},
              SIMULATION_LISTENER
            }))
            this.devices.set(device.id, device)
          })
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
