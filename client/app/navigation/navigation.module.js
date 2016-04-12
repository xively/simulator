const angular = require('angular')

const navigationBarOptions = require('./navigation-bar-options.value')
const navigationBarComponent = require('./navigation-bar.component')

const navigationModule = angular.module('concaria.navigation', [
  require('angular-ui-router')
])
  .value('navigationBarOptions', navigationBarOptions)
  .component('navigationBar', navigationBarComponent)

module.exports = navigationModule
