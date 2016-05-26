const _ = require('lodash')

/* @ngInject */
function devicesFactory ($log, $http, $q, mqttService, blueprintService, timeseriesService, socketService, CONFIG, DEVICES_CONFIG) {
  const unsubscribeCallback = Symbol('unsubscribeCallback')

  return new class DevicesService {
    constructor () {
      this.devices = {}
    }

    /**
     * Add new device
     * @param {Object} device
     */
    addDevice (device) {
      if (!this.devices[device.id]) {
        device.ok = true
        device.sensors = {}
        device.channels = device.channels
          .filter((channel) => !(DEVICES_CONFIG.general.hiddenChannels || []).includes(channel.channelTemplateName))
        device.channels.forEach((channel) => {
          const name = channel.channel.split('/').pop()
          device.sensors[name] = {
            numericValue: '-',
            stringValue: '-',
            type: channel.persistenceType
          }
        })
        device.update = (name, value) => {
          socketService.sendMessage(device.id, 'update', { name, value })
        }
        device.subscribe = this.subscribeDevice.bind(this, device)
        this.devices[device.id] = device
      }

      return this.devices[device.id]
    }

    /**
     * Subscribe listeners to device channels
     * Update device.sensors on message
     * @param  {Object} device
     */
    subscribeDevice (device) {
      const listener = (update) => {
        device.ok = true
        _.assign(device.sensors, update)
      }
      const unsubscribeCallbacks = []
      device.channels.forEach((channel) => {
        const unsubscribe = mqttService.subscribe(channel.channel, listener)
        unsubscribeCallbacks.push(unsubscribe)
      })
      device[unsubscribeCallback] = () => unsubscribeCallbacks.forEach((callback) => callback())
      return device[unsubscribeCallback]
    }

    /**
     * Unsubscribe MQTT listeners for a given device
     * @param  {Object|ID} device
     */
    unsubscribeDevice (device) {
      if (!_.isObject(device)) {
        device = this.devices[device]
      }
      device[unsubscribeCallback] && device[unsubscribeCallback]()
    }

    /**
     * Get device from Blueprint and subscribe for MQTT updates
     * @param  {Number} id
     * @return {Promise}
     */
    getDevice (id) {
      if (!this.devices[id]) {
        return blueprintService.getV1(`devices/${id}`)
          .then((response) => response.data.device)
          .then((device) => this.addDevice(device, true))
      }
      return $q.resolve(this.devices[id])
    }

    /**
     * Get devices from Blueprint and subscribe for MQTT updates
     * @return {Promise}
     */
    getDevices () {
      return blueprintService.getV1('devices', { pageSize: 100 })
        .then((response) => response.data.devices.results)
        .then((devices) => {
          devices.forEach((device) => this.addDevice(device))
          return this.devices
        })
    }

    /**
     * Delete device
     * @param  {Object|ID} device
     */
    deleteDevice (device) {
      this.unsubscribeDevice(device)
      delete this.devices[device.id || device]
    }

    /**
     * Get device templates from Blueprint
     * @return {Promise}
     */
    getDeviceTemplates () {
      return blueprintService.getV1('devices/templates')
        .then((response) => {
          return response.data.deviceTemplates.results.reduce((templates, template) => {
            templates[template.id] = template
            return templates
          }, {})
        })
    }

    /**
     * Get time series for a device
     * @param  {Object} device
     * @return {Promise}
     */
    getTimeSeries (deviceOrChannel, pageSize = 100) {
      // for one channel
      if (_.isString(deviceOrChannel)) {
        const channel = deviceOrChannel
        return timeseriesService.getV4(`data/${channel}/latest`, { pageSize })
        .then((response) => {
          if (response.status !== 200) {
            $log.error('TimeSeries response:', response)
            throw new Error(response.statusText)
          }
          return response.data.result.reverse()
        })
      }

      // for all channels
      // TODO (probably useless)
      const device = deviceOrChannel
      const promises = device.channels
        .filter((channel) => channel.persistenceType === 'timeSeries')
        .map((channel) => timeseriesService.getV4(`data/${channel.channel}`, { pageSize }))

      return $q.all(promises)
        .then((timeseries) => timeseries.filter((response) => response.status !== 404))
        .then((timeseries) => timeseries.map((response) => response.data.result.reverse()))
    }
  }
}

module.exports = devicesFactory
