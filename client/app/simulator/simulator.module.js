const angular = require('angular')
const angularAnimate = require('angular-animate')
const angularRouter = require('angular-ui-router')

const commonModule = require('../common')
const mobileModule = require('./mobile')
const simulatorRoute = require('./simulator.route')
const navigation = require('./navigation')
const virtualDevice = require('./virtual-device')
const simulatorComponent = require('./simulator.component')

<<<<<<< 47e3d9bd5dccf72fa67894778be9fa9e20fd47cc
const simulatorModule = angular.module('simulator.devies', [
  angularAnimate,
  angularRouter,
  commonModule,
  mobileModule
=======
const simulatorModule = angular.module('simulator.device', [
  require('angular-animate'),
  require('angular-ui-router'),
  commonModule,
  virtualDevice,
  navigation
>>>>>>> refactor(app): virtual device & navigation
])
  .config(simulatorRoute)
  .component('simulator', simulatorComponent)

module.exports = simulatorModule
