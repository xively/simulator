const blueprint = require('../blueprint')
const mqtt = require('../mqtt')
const socket = require('../socket')
const timeseries = require('../timeseries')
const devicesService = require('./devices.service')

const devices = angular.module('simulator.common.services.devices', [
  blueprint,
  mqtt,
  socket,
  timeseries
])
  .factory('devicesService', devicesService)

module.exports = devices
