const angular = require('angular')
const authorizationModule = require('../authorization')
const blueprintService = require('./blueprint.service')

const blueprint = angular.module('simulator.common.services.blueprint', [
  authorizationModule
])
  .factory('blueprintService', blueprintService)

module.exports = blueprint
