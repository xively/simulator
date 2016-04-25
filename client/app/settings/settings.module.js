const angular = require('angular')
const commonModule = require('../common')

const settingsRoute = require('./settings.route')

const settingsModule = angular.module('simulator.settings', [
  require('angular-ui-router'),
  commonModule
])
  .config(settingsRoute)

module.exports = settingsModule
