const angular = require('angular')
const iphoneFrameComponent = require('./iphone-frame.component')

const iphoneFrame = angular.module('simulator.common.components.iphoneFrame', [])
  .component('iphoneFrame', iphoneFrameComponent)

module.exports = iphoneFrame
