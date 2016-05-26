const angular = require('angular')
const header = require('./header')
const modal = require('./modal')

const commonComponents = angular.module('simulator.common.components', [
  header,
  modal
])

module.exports = commonComponents
