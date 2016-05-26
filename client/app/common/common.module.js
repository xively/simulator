const angular = require('angular')
const EVENTS = require('./events.constant.js')
const mqttService = require('./mqtt.service')
const blueprintService = require('./blueprint.service')
const timeseriesService = require('./timeseries.service')
const devicesService = require('./devices.service')
const socketService = require('./socket.service')
const smsService = require('./sms.service')
const loadingInterceptor = require('./loading.interceptor')
const utils = require('./utils.service')
const bindHtmlCompileDirective = require('./bind-html-compile.directive')
const config = require('./common.config')
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
  .factory('mqttService', mqttService)
  .factory('blueprintService', blueprintService)
  .factory('timeseriesService', timeseriesService)
  .factory('devicesService', devicesService)
  .factory('socketService', socketService)
  .factory('smsService', smsService)
  .factory('loadingInterceptor', loadingInterceptor)
  .factory('utils', utils)
  .directive('bindHtmlCompile', bindHtmlCompileDirective)
  .config(config)
  .run(run)

module.exports = common
