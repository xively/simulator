const angular = require('angular')
const commonModule = require('../common')
const deviceListRoute = require('./device-list.route')

const devicesModule = angular.module('simulator.devies', [
  require('angular-animate'),
  require('angular-ui-router'),
  commonModule
])
  .config(deviceListRoute)

module.exports = devicesModule
