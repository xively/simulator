const angular = require('angular')
const qrcodeComponent = require('./qrcode.component')

const qrcode = angular.module('simulator.common.components.qrcode', [])
  .component('qrcode', qrcodeComponent)

module.exports = qrcode
