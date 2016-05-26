const angular = require('angular')
const headerComponent = require('./header.component')

const header = angular.module('simulator.common.components.header', [])
  .component('header', headerComponent)

module.exports = header
