const angular = require('angular')

const commonModule = require('../common')
const simulatorRoute = require('./simulator.route')

const simulatorModule = angular.module('simulator.devies', [
  require('angular-animate'),
  require('angular-ui-router'),
  commonModule
])
  .config(simulatorRoute)

module.exports = simulatorModule
