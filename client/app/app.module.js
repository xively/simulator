require('./app.less')
require('./modal.component.less') // FIXME

const angular = require('angular')
const commonModule = require('./common')
const devicesModule = require('./devices')
const rulesModule = require('./rules')
const navigationModule = require('./navigation')
const settingsModule = require('./settings')
const config = require('./app.config')

// custom widgets module
const widgetsModule = require('../../config/devices/widgets')

const app = angular.module('simulator', [
  require('angular-ui-router'),
  commonModule,
  navigationModule,
  devicesModule,
  rulesModule,
  widgetsModule,
  settingsModule
])
  .config(config)

module.exports = app
