const angular = require('angular')

const config = require('./loading.config')
const loadingComponent = require('./loading.component')

const loading = angular.module('simulator.common.components.loading', [])
  .config(config)
  .component('loadingBar', loadingComponent)

module.exports = loading
