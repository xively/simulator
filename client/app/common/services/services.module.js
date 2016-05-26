const angular = require('angular')
const authorization = require('./authorization')
const blueprint = require('./blueprint')
const mqtt = require('./mqtt')
const utils = require('./utils')

const commonServices = angular.module('simulator.common.services', [
  authorization,
  blueprint,
  mqtt,
  utils
])

module.exports = commonServices
