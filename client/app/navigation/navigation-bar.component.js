const _ = require('lodash')

require('./navigation-bar.less')
const xiLogo = require('./images/xi-logo.svg')
const xivelyLogo = require('./images/xively-logo.png')
const dashboardIcon = require('./images/dashboard-icon.svg')
const devicesIcon = require('./images/devices-icon.svg')
const rulesIcon = require('./images/rules-icon.svg')
const settingsIcon = require('./images/settings-icon.svg')

/* @ngInject */
const navComponent = {
  template: `
    <div class="loading-bar">
      <div ng-show="navigationBar.loading">
        <div class="bar-1"></div>
        <div class="bar-2"></div>
      </div>
    </div>
    <nav class="navigation-bar" ng-show="navigationBar.showHeader">
      <div class="navigation-items">
        <div class="navigation-item logo" ng-if="navigationBar.showNavigation">
          ${xiLogo}
        </div>
        <div class="navigation-item" ng-if="!navigationBar.showNavigation">
          <div class="logo">
            <img src="${xivelyLogo}"></img>
            <div>Product Simulator</div>
          </div>
        </div>
        <div class="navigation-item" ui-sref="devices" ui-sref-active="active" ng-show="navigationBar.showNavigation">
          <span class="navigation-item-icon">${devicesIcon}</span>
          <span class="navigation-item-text">Devices</span>
          <span class="navigation-item-triangle"></span>
        </div>
        <div class="navigation-item" ng-show="navigationBar.showNavigation" ng-click="navigationBar.navigateToDemo()">
          <span class="navigation-item-icon">${dashboardIcon}</span>
          <span class="navigation-item-text">Demo</span>
          <span class="navigation-item-triangle"></span>
        </div>
        <div class="navigation-item" ui-sref="rules" ui-sref-active="active" ng-show="navigationBar.showNavigation">
          <span class="navigation-item-icon">${rulesIcon}</span>
          <span class="navigation-item-text">Rules</span>
          <span class="navigation-item-triangle"></span>
        </div>
        <div class="navigation-item" ui-sref="settings" ui-sref-active="active" ng-show="navigationBar.showNavigation">
          <span class="navigation-item-icon">${settingsIcon}</span>
          <span class="navigation-item-text">Settings</span>
          <span class="navigation-item-triangle"></span>
        </div>
      </div>
    </nav>
  `,
  controllerAs: 'navigationBar',
  /* @ngInject */
  controller ($log, $state, $scope, $location, blueprintService, EVENTS) {
    $scope.$watch(() => {
      return $location.search()
    }, (query) => {
      const { header = 1, navigation = 1 } = query
      this.showHeader = _.toNumber(header)
      this.showNavigation = _.toNumber(navigation)
    })

    $scope.$on(EVENTS.LOADING, (event, args) => {
      this.loading = args.loading
    })

    this.navigateToDemo = () => {
      blueprintService.getV1('devices', { pageSize: 1 }).then((response) => {
        const id = response.data.devices.results[0].id
        $state.go('devices.device-demo', { id, header: 0 })
      })
    }

    // TODO dinamically populate navigation items?
    const states = $state.get().splice(1)
    $log.debug('navigation-bar:', states)
  }
}

module.exports = navComponent
