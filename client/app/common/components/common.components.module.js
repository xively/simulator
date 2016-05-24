const angular = require('angular')
const modal = require('./modal')

const commonComponents = angular.module('simulator.common.components', [
  modal
])

module.exports = commonComponents
