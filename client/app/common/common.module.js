const angular = require('angular')
const EVENTS = require('./events.constant.js')
const segmentConfig = require('./segment.constant.js')
const authService = require('./auth.service')
const mqttService = require('./mqtt.service')
const blueprintService = require('./blueprint.service')
const timeseriesService = require('./timeseries.service')
const authInterceptor = require('./auth.interceptor')
const devicesService = require('./devices.service')
const socketService = require('./socket.service')
const smsService = require('./sms.service')
const loadingInterceptor = require('./loading.interceptor')
const utils = require('./utils.service')
const bindHtmlCompileDirective = require('./bind-html-compile.directive')
const config = require('./common.config')
const run = require('./common.run')

const commonComponents = require('./components')

const common = angular.module('simulator.common', [
  require('angular-ui-router'),
  require('angular-segment-analytics'),
  commonComponents
])
  .constant('CONFIG', window.APP_CONFIG || {})
  .constant('DEVICES_CONFIG', window.DEVICES_CONFIG || {})
  .constant('EVENTS', EVENTS)
  .constant('segmentConfig', segmentConfig)
  .factory('authService', authService)
  .factory('mqttService', mqttService)
  .factory('blueprintService', blueprintService)
  .factory('timeseriesService', timeseriesService)
  .factory('authInterceptor', authInterceptor)
  .factory('devicesService', devicesService)
  .factory('socketService', socketService)
  .factory('smsService', smsService)
  .factory('loadingInterceptor', loadingInterceptor)
  .factory('utils', utils)
  .directive('bindHtmlCompile', bindHtmlCompileDirective)
  .config(config)
  .run(run)

module.exports = common
