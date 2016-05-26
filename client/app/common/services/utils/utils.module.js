const angular = require('angular')
const utilsService = require('./utils.service')

const utils = angular.module('simulator.common.services.utils', [])
  .factory('utils', utilsService)

module.exports = utils
