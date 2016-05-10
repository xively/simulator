const angular = require('angular')

const commonModule = require('../../../client/app/common')
const badgeButtonComponent = require('./badge-button')

const widgetsModule = angular.module('concaria.widgets', [
  commonModule
])
  .component('badgeButton', badgeButtonComponent)

module.exports = widgetsModule
