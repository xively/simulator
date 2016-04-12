const angular = require('angular')
const commonModule = require('../common')
const navigationModule = require('../navigation')
const devicesRoute = require('./devices.route')
const deviceRoute = require('./device.route')
const deviceDemoRoute = require('./device-demo.route')
const devicePanelComponent = require('./device-panel.component')
const timeseriesChartComponent = require('./timeseries-chart.component')
const iphoneFrameComponent = require('./iphone-frame.component')
const tooltipComponent = require('./tooltip.component')
const qrcodeComponent = require('./qrcode.component')
const shareModalComponent = require('./share-modal.component')
const notificationComponent = require('./notification.component')

const devicesModule = angular.module('concaria.devies', [
  require('angular-animate'),
  require('angular-ui-router'),
  commonModule,
  navigationModule
])
  .config(devicesRoute)
  .config(deviceRoute)
  .config(deviceDemoRoute)
  .component('devicePanel', devicePanelComponent)
  .component('timeseriesChart', timeseriesChartComponent)
  .component('iphoneFrame', iphoneFrameComponent)
  .component('tooltip', tooltipComponent)
  .component('qrcode', qrcodeComponent)
  .component('shareModal', shareModalComponent)
  .component('notification', notificationComponent)

module.exports = devicesModule
