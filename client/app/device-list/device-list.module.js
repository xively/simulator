const angular = require('angular')

const commonModule = require('../common')
const deviceListRoute = require('./device-list.route')
const deviceListComponent = require('./device-list.component')

const devicesModule = angular.module('simulator.deviceList', [
  require('angular-animate'),
  require('angular-ui-router'),
  commonModule
])
  .config(deviceListRoute)
  .component('deviceList', deviceListComponent)

module.exports = devicesModule
