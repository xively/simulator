const angular = require('angular')
const copyDirective = require('./copy.directive')

const copy = angular.module('simulator.common.components.copy', [])
  .directive('copy', copyDirective)

module.exports = copy
