const angular = require('angular')
const authorization = require('./authorization')

const commonServices = angular.module('simulator.common.services', [
  authorization
])

module.exports = commonServices
