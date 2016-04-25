const angular = require('angular')

const rulesService = require('./rules.service')
const conditionList = require('./condition-list.component')
const rulesRoute = require('./rules.route')
const rulesComponent = require('./rules.component')
const run = require('./rules.run')

const rulesModule = angular.module('simulator.rules', [
  require('angular-ui-router')
])
  .config(rulesRoute)
  .run(run)
  .factory('rulesService', rulesService)
  .component('rulesComponent', rulesComponent)
  .component('conditionList', conditionList)

module.exports = rulesModule
