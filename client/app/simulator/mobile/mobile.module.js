const angular = require('angular')
const angularRouter = require('angular-ui-router')
const commonModule = require('../../common')

const devicePanelComponent = require('./device-panel.component')
const timeseriesChartComponent = require('./timeseries-chart.component')
const mobileRoute = require('./mobile.route')

const mobile = angular.module('simulator.devices.mobile', [
  angularRouter,
  commonModule
])
  .component('devicePanel', devicePanelComponent)
  .component('timeseriesChart', timeseriesChartComponent)
  .config(mobileRoute)

module.exports = mobile
