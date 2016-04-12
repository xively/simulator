require('./navigation-bar.less')
const xiLogo = require('./images/xi-logo.svg')
const dashboardIcon = require('./images/dashboard-icon.svg')
const devicesIcon = require('./images/devices-icon.svg')
const rulesIcon = require('./images/rules-icon.svg')
const settingsIcon = require('./images/settings-icon.svg')

/* @ngInject */
const navComponent = {
  template: `
    <nav class="navigation-bar" ng-show="navigationBar.options.visible">
      <div class="loading-bar">
        <div ng-show="navigationBar.loading">
          <div class="bar-1"></div>
          <div class="bar-2"></div>
        </div>
      </div>
      <div class="navigation-items">
        <div class="navigation-item logo">
          ${xiLogo}
        </div>
        <!-- TODO do we need the dashboard?
        <div class="navigation-item">
          <span class="navigation-item-icon">${dashboardIcon}</span>
          <span class="navigation-item-text">Dashboard</span>
          <span class="navigation-item-triangle"></span>
        </div>
        -->
        <div class="navigation-item" ui-sref="devices" ui-sref-active="active">
          <span class="navigation-item-icon">${devicesIcon}</span>
          <span class="navigation-item-text">Devices</span>
          <span class="navigation-item-triangle"></span>
        </div>
        <div class="navigation-item" ui-sref="rules" ui-sref-active="active">
          <span class="navigation-item-icon">${rulesIcon}</span>
          <span class="navigation-item-text">Rules</span>
          <span class="navigation-item-triangle"></span>
        </div>
        <div class="navigation-item" ui-sref="settings" ui-sref-active="active">
          <span class="navigation-item-icon">${settingsIcon}</span>
          <span class="navigation-item-text">Settings</span>
          <span class="navigation-item-triangle"></span>
        </div>
      </div>
    </nav>
  `,
  controllerAs: 'navigationBar',
  /* @ngInject */
  controller ($log, $state, $scope, navigationBarOptions, EVENTS) {
    this.options = navigationBarOptions

    $scope.$on(EVENTS.loading, (event, args) => {
      this.loading = args.loading
    })

    // TODO dinamically populate navigation items?
    const states = $state.get().splice(1)
    $log.debug('navigation-bar:', states)
  }
}

module.exports = navComponent
