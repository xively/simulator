const angular = require('angular')
const headerBarComponent = require('./header-bar.component')

const header = angular.module('simulator.common.components.header-bar', [])
  .component('headerBar', headerBarComponent)

module.exports = header
