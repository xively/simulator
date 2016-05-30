const applicationConfigService = require('./application-config.service')

const applicationConfig = angular.module('simulator.common.services.application-config', [])
  .factory('applicationConfigService', applicationConfigService)

module.exports = applicationConfig
