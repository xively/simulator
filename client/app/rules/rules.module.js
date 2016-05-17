const angular = require('angular')

const rulesService = require('./rules.service')
const conditionList = require('./condition-list.component')
const rulesComponent = require('./rules.component')

const rulesModule = angular.module('simulator.rules', [])
  .factory('rulesService', rulesService)
  .component('rules', rulesComponent)
  .component('conditionList', conditionList)

module.exports = rulesModule
