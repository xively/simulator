const angular = require('angular')
const tabsComponent = require('./tabs.component')
const tabComponent = require('./tab.component')

const tabs = angular.module('simulator.common.components.tabs', [])
  .component('tabs', tabsComponent)
  .component('tab', tabComponent)

module.exports = tabs
