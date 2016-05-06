'use strict'

const logger = require('winston')
const _ = require('lodash')
const blueprint = require('../xively').blueprint
const db = require('../database')
const Device = require('./device')

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
}

module.exports = new DeviceStore()
