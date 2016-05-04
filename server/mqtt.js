'use strict'

const mqtt = require('mqtt')
const config = require('../config/server')

const mqttClient = mqtt.connect(`mqtts://${config.account.brokerHost}:${config.account.brokerPort}`, {
  username: config.account.brokerUser,
  password: config.account.brokerPassword
})

module.exports = mqttClient
