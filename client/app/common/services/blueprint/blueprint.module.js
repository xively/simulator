const angular = require('angular')
const authorization = require('../authorization')
const blueprintService = require('./blueprint.service')

const blueprint = angular.module('simulator.common.services.blueprint', [
  authorization
])
  .factory('blueprintService', blueprintService)

module.exports = blueprint
