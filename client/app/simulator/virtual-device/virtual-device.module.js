const angular = require('angular')

const virtualDeviceComponent = require('./virtual-device.component')
const tooltipComponent = require('./tooltip.component')

const virtualDevice = angular.module('simulator.virtualDevice', [])
  .component('virtualDevice', virtualDeviceComponent)
  .component('tooltip', tooltipComponent)

module.exports = virtualDevice
