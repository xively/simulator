require('./app.less')

const angular = require('angular')
const commonModule = require('./common')
const deviceListModule = require('./device-list')
const rulesModule = require('./rules')
const settingsModule = require('./settings')
const simulatorModule = require('./simulator')
const config = require('./app.config')

// custom widgets module
const widgetsModule = require('../../config/devices/widgets')

const app = angular.module('simulator', [
  require('angular-ui-router'),
  commonModule,
  deviceListModule,
  rulesModule,
  widgetsModule,
  settingsModule,
  simulatorModule
])
  .config(config)

module.exports = app
