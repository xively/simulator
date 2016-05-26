const smsService = require('./sms.service')

const sms = angular.module('simulator.common.services.sms', [])
  .factory('smsService', smsService)

module.exports = sms
