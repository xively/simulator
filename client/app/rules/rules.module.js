const angular = require('angular')

const rulesService = require('./rules.service')
const conditionList = require('./condition-list.component')
const rulesRoute = require('./rules.route')
const run = require('./rules.run')

const rulesModule = angular.module('concaria.rules', [
  require('angular-ui-router')
])
  .factory('rulesService', rulesService)
  .component('conditionList', conditionList)
  .config(rulesRoute)
  .run(run)

module.exports = rulesModule
