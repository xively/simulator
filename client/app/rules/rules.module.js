const angular = require('angular')

const rulesService = require('./rules.service')
const conditionList = require('./condition-list.component')
const rulesRoute = require('./rules.route')

const rulesModule = angular.module('concaria.rules', [
  require('angular-ui-router')
])
  .factory('rulesService', rulesService)
  .component('conditionList', conditionList)
  .config(rulesRoute)

module.exports = rulesModule
