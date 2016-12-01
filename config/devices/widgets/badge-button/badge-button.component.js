require('./badge-button.component.less')
const buttonImage = require('./Button_Flat_White.svg')

/* @ngInject */
const badgeButtonComponent = {
  template: `
    <div class="badge-button" style="height:{{ badgeControl.options.height }}px; width:{{ badgeControl.options.width }}px" ng-click="badgeControl.toggleButton()">
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

    this.toggleButton = () => {
      if (!this.buttonActive) {
        this.buttonActive = true
        $timeout(() => {
          this.device.sensors[this.options.sensorName] = 0
          this.buttonActive = false
        }, 3000)

        this.device.update(this.options.sensorName, 1)
      }
    }
  }
}

module.exports = badgeButtonComponent
