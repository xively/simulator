const angular = require('angular')

const navigationBarComponent = require('./navigation-bar.component')

const navigationModule = angular.module('simulator.navigation', [
  require('angular-ui-router')
])
  .component('navigationBar', navigationBarComponent)

module.exports = navigationModule
