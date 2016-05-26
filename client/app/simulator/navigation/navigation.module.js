const angular = require('angular')

const navigationComponent = require('./navigation.component')

const navigation = angular.module('simulator.navigation', [])
  .component('navigation', navigationComponent)

module.exports = navigation
