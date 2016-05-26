const rulesIcon = require('./images/rules-icon.svg')
const settingsIcon = require('./images/settings-icon.svg')
const xiLogo = require('./images/xi-logo.svg')
const xivelyLogo = require('./images/xively-logo.png')
const buttonPlay = require('./images/button-play.svg')
const buttonPause = require('./images/button-pause.svg')

require('./navigation.component.less')

/* @ngInject */
const navigationComponent = {
  template: `
    <div class="navigation">
      <div class="navigation-container">
        <div class="logo">
          <img src="${xivelyLogo}"></img>
        </div>
        <div class="navigation-items">
          <!--
            <div class="navigation-item" ng-click="navigation.toggleSimulation()">
              <span class="navigation-item-icon" ng-hide="navigation.simulate">${buttonPlay}</span>
              <span class="navigation-item-icon pause-button" ng-show="navigation.simulate">${buttonPause}</span>
              <span class="navigation-item-text">{{ navigation.simulate ? '\&nbsp;Stop\&nbsp;' : 'Start' }} simulation</span>
            </div>
          -->
          <div class="navigation-item" ng-click="navigation.openModal('settings')">
            <span class="navigation-item-icon">${settingsIcon}</span>
            <span class="navigation-item-text">Settings</span>
          </div>
          <div class="navigation-item" ng-click="navigation.openModal('rules')">
            <span class="navigation-item-icon">${rulesIcon}</span>
            <span class="navigation-item-text">Rules</span>
          </div>
          <a class="navigation-item logo" href="{{ navigation.cpmLink }}" target="_blank">
            <span class="navigation-item-icon">${xiLogo}</span>
            <span class="navigation-item-text">CPM</span>
          </a>
        </div>
      </div>
    </div>
  `,
  controllerAs: 'navigation',
  /* @ngInject */
  controller ($window, modalService, simulatorService, CONFIG) {
    this.cpmLink = `https://${CONFIG.account.idmHost.replace('id.', 'app.')}/login?accountId=${CONFIG.account.accountId}`

    this.openModal = (name) => {
      if (name === 'rules' && CONFIG.habanero.embedded) {
        return $window.open('/goto-orchestrator', '_blank')
      }
      modalService.open(name)
    }

    this.simulate = false
    this.toggleSimulation = () => {
      this.simulate = !this.simulate
      simulatorService.toggleSimulation()
    }
  }
}

module.exports = navigationComponent
