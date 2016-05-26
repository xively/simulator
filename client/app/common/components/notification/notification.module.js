const angular = require('angular')
const notificationComponent = require('./notification.component')

const notification = angular.module('simulator.common.components.notification', [])
  .component('notification', notificationComponent)

module.exports = notification
