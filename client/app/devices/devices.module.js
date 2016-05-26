const angular = require('angular')
const commonModule = require('../common')
const deviceRoute = require('./device.route')
const deviceDemoRoute = require('./device-demo.route')
const devicePanelComponent = require('./device-panel.component')
const timeseriesChartComponent = require('./timeseries-chart.component')
const iphoneFrameComponent = require('./iphone-frame.component')
const tooltipComponent = require('./tooltip.component')
const shareModalComponent = require('./share-modal.component')
const notificationComponent = require('./notification.component')

const devicesModule = angular.module('simulator.devies', [
  require('angular-animate'),
  require('angular-ui-router'),
  commonModule
])
  .config(deviceRoute)
  .config(deviceDemoRoute)
  .component('devicePanel', devicePanelComponent)
  .component('timeseriesChart', timeseriesChartComponent)
  .component('iphoneFrame', iphoneFrameComponent)
  .component('tooltip', tooltipComponent)
  .component('shareModal', shareModalComponent)
  .component('notification', notificationComponent)

module.exports = devicesModule
