'use strict'

const mqtt = require('mqtt')

class MqttListener {
  constructor (options) {
    if (!options) {
      throw new TypeError('Options are missing')
    }

    this.options = options
    this.client = mqtt.connect(options.host, options)

    this.devices = new Map()
    this.channels = new Map()
    this.topics = new Map()
  }

  addDevice (id) {
    this.devices.set(id, true)
    this.channels.forEach((value, channel) => {
      this.addTopic(id, channel)
    })
  }

  addTopic (id, channel) {
    const topic = `xi/blue/v1/${this.options.accountId}/d/${id}/${channel}`
    this.topics.set(topic, false)
  }
}

module.exports = MqttListener
