require('./nest-display.component.less')

/* @ngInject */
const nestDisplayComponent = {
  template: `
    <div class="nest-display" ng-click="!display.device.ok || display.changeState()">
      <div class="purifier-device-switch">
      <div class="nest-state-indicator" ng-class="'state-' + display.device.sensors.state.numericValue"></div>
      <ul>
        <li>Unlock</li>
        <li>Lock</li>
      </ul>
      </div>
    </div>
  `,
  replace: true,
  bindings: {
    device: '='
  },
  controllerAs: 'display',
  controller ($scope, $stateParams, devicesService) {
    var device = this.device
    $scope.$watch(() => {
      return this.device.sensors.state.numericValue
    }, (newValue) => {
      // This handles lock state change
      // 0 means that the lock is unlocked
      // 1 means that the lock is locked
      // apply state change on UI
      device.sensors.state.numericValue = newValue
      console.log('NEW VALUE: ', newValue)
      updateImage()
    })

    this.changeState = () => {
      if (!_.isNumber(this.device.sensors.state.numericValue)) {
        this.device.sensors.state.numericValue = 0
      }
      this.device.sensors.state.numericValue = (this.device.sensors.state.numericValue + 1) % 2
      // The BRAINFUCK's IDIOT pair!
      this.device.update('lock', JSON.stringify({
        command: 'lock',
        option: this.device.sensors.state.numericValue
      }))

      updateImage()
    }

    function updateImage() {
      if ($scope.config !== undefined) {
        device.sensors.state.numericValue === 0 ? $scope.config.image = '/devices/images/smartlock-design_locked.png' : $scope.config.image = '/devices/images/smartlock-design_open.png'
      }
    }

    this.config = $scope.config = {}

    devicesService.getDeviceTemplates().then((templates) => {
      devicesService.getDevice($stateParams.id).then((d) => {
        $scope.config = DEVICES_CONFIG[templates[device.deviceTemplateId].name] || undefined
      })
    })
  }
}

module.exports = nestDisplayComponent
