const angular = require('angular')
const applicationConfig = require('./application-config')
const authorization = require('./authorization')
const blueprint = require('./blueprint')
const devices = require('./devices')
const location = require('./location')
const mqtt = require('./mqtt')
const sms = require('./sms')
const socket = require('./socket')
const timeseries = require('./timeseries')
const utils = require('./utils')

const commonServices = angular.module('simulator.common.services', [
  applicationConfig,
  authorization,
  blueprint,
  devices,
  location,
  mqtt,
  sms,
  socket,
  timeseries,
  utils
])

module.exports = commonServices
