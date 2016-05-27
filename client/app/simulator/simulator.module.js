const angular = require('angular')
const angularAnimate = require('angular-animate')
const angularRouter = require('angular-ui-router')

const common = require('../common')
const mobile = require('./mobile')
const simulatorRoute = require('./simulator.route')
const navigation = require('./navigation')
const virtualDevice = require('./virtual-device')
const simulatorComponent = require('./simulator.component')

const simulatorModule = angular.module('simulator.devies', [
  angularAnimate,
  angularRouter,
  common,
  mobile,
  virtualDevice,
  navigation
])
  .config(simulatorRoute)
  .component('simulator', simulatorComponent)

module.exports = simulatorModule
