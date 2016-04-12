require('./fan-state-control.component.less')

/* @ngInject */
const fanStateControlComponent = {
  template: `
    <div class="fan-state-control">
      <div ng-click="fanStateControl.changeState(0)" ng-class="{selected: fanStateControl.selected === 0}">Off</div>
      <div ng-click="fanStateControl.changeState(1)" ng-class="{selected: fanStateControl.selected === 1}">Low</div>
      <div ng-click="fanStateControl.changeState(2)" ng-class="{selected: fanStateControl.selected === 2}">High</div>
    </div>
  `,
  replace: true,
  bindings: {
    device: '='
  },
  controllerAs: 'fanStateControl',
  /* @ngInject */
  controller ($scope) {
    $scope.$watch(() => {
      return this.device.sensors.fan.numericValue
    }, (newValue) => {
      this.selected = newValue
    })
    this.changeState = (value) => {
      this.device.update('fan', value)
      this.selected = value
    }
  }
}

module.exports = fanStateControlComponent
