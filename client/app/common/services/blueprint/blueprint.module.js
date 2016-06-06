const angular = require('angular')
const authorization = require('../authorization')
const location = require('../location')
const blueprintService = require('./blueprint.service')

const blueprint = angular.module('simulator.common.services.blueprint', [
  authorization,
  location
])
  .factory('blueprintService', blueprintService)

module.exports = blueprint
