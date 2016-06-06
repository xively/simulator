const angular = require('angular')
const locationService = require('./location.service')

const location = angular.module('simulator.common.services.location', [])
  .factory('locationService', locationService)

module.exports = location
