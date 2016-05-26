const angular = require('angular')
const utils = require('../utils')
const mqttService = require('./mqtt.service')

const mqtt = angular.module('simulator.common.services.mqtt', [
  utils
])
  .factory('mqttService', mqttService)

module.exports = mqtt
