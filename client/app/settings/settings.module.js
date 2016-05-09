const angular = require('angular')
const commonModule = require('../common')

const settingsService = require('./settings.service')
const settingsRoute = require('./settings.route')
const settingsComponent = require('./settings.component')

require('brace')
require('brace/mode/json')
require('angular-ui-ace')

const settingsModule = angular.module('simulator.settings', [
  require('angular-ui-router'),
  'ui.ace',
  commonModule
])
  .config(settingsRoute)
  .factory('settingsService', settingsService)
  .component('settingsComponent', settingsComponent)

module.exports = settingsModule
