const angular = require('angular')
const authorization = require('./authorization')
const blueprint = require('./blueprint')
const devices = require('./devices')
const mqtt = require('./mqtt')
const sms = require('./sms')
const socket = require('./socket')
const timeseries = require('./timeseries')
const utils = require('./utils')

const commonServices = angular.module('simulator.common.services', [
  authorization,
  blueprint,
  devices,
  mqtt,
  sms,
  socket,
  timeseries,
  utils
])

module.exports = commonServices
