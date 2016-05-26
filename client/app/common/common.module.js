const angular = require('angular')
const EVENTS = require('./events.constant.js')
const run = require('./common.run')

const commonComponents = require('./components')
const commonServices = require('./services')

const common = angular.module('simulator.common', [
  require('angular-ui-router'),
  commonComponents,
  commonServices
])
  .constant('CONFIG', window.APP_CONFIG || {})
  .constant('DEVICES_CONFIG', window.DEVICES_CONFIG || {})
  .constant('EVENTS', EVENTS)
  .run(run)

module.exports = common
