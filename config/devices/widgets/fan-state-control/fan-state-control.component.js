require('./fan-state-control.component.less')

/* @ngInject */
const fanStateControlComponent = {
  template: `
    <div class="fan-state-control">
      <button ng-repeat="button in ::fanStateControl.buttons"
              ng-click="fanStateControl.changeState($index)"
              ng-class="{selected: fanStateControl.selected === $index}"
              ng-disabled="!fanStateControl.device.ok">
              {{ button }}
      </button>
    </div>
  `,
  replace: true,
  bindings: {
    device: '='
  },
  controllerAs: 'fanStateControl',
  /* @ngInject */
  controller ($scope) {
    this.buttons = ['Off', 'Low', 'High']

    $scope.$watch(() => {
      return this.device.sensors.fan.numericValue
    }, (newValue) => {
      this.selected = newValue
    })
    this.changeState = (value) => {
      this.device.update('speed', JSON.stringify({
        command: 'speed',
        option: this.buttons[value].toLowerCase()
      }))
      this.selected = value
    }
  }
}

module.exports = fanStateControlComponent
