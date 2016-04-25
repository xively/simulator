const angular = require('angular')
const commonModule = require('../common')

const settingsRoute = require('./settings.route')
const settingsComponent = require('./settings.component')

const settingsModule = angular.module('simulator.settings', [
  require('angular-ui-router'),
  commonModule
])
  .config(settingsRoute)
  .component('settingsComponent', settingsComponent)

module.exports = settingsModule
