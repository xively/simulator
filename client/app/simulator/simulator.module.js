const angular = require('angular')
const angularAnimate = require('angular-animate')
const angularRouter = require('angular-ui-router')

const commonModule = require('../common')
const mobileModule = require('./mobile')
const simulatorRoute = require('./simulator.route')

const simulatorModule = angular.module('simulator.devies', [
  angularAnimate,
  angularRouter,
  commonModule,
  mobileModule
])
  .config(simulatorRoute)

module.exports = simulatorModule
