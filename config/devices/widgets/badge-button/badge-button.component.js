require('./badge-button.component.less')
const buttonImage = require('./Button_Flat_White.svg')

/* @ngInject */
const badgeButtonComponent = {
  template: `
    <div class="badge-button" ng-click="badgeControl.toggleButton()">
      <span ng-class="{ '{{badgeControl.options.toggleColor}}': badgeControl.buttonActive}">${buttonImage}</span>
      <span class="label">{{ badgeControl.options.label }}</span>
    </div>
  `,
  replace: true,
  bindings: {
    device: '=',
    options: '='
  },
  controllerAs: 'badgeControl',
  /* @ngInject */
  controller ($timeout) {
    this.buttonActive = false

    this.toggleButton = function () {
      if (!this.buttonActive) {
        this.buttonActive = true
        $timeout(() => {
          this.buttonActive = false
        }, 3000)
      }
    }
  }
}

module.exports = badgeButtonComponent
