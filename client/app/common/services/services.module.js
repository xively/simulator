const angular = require('angular')
const authorization = require('./authorization')
const blueprint = require('./blueprint')

const commonServices = angular.module('simulator.common.services', [
  authorization,
  blueprint
])

module.exports = commonServices
