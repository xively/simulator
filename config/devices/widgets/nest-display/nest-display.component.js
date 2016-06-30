require('./nest-display.component.less')

/* @ngInject */
const nestDisplayComponent = {
  template: `
    <div class="nest-display" ng-click="!display.device.ok || display.changeState()">
      <div class="purifier-device-switch">
      <div class="nest-state-indicator" ng-class="'state-' + display.device.sensors.state.numericValue"></div>
      <ul>
        <li>Locked</li>
        <li>Unlocked</li>
      </ul>
      </div>
    </div>
  `,
  replace: true,
  bindings: {
    device: '='
  },
  controllerAs: 'display',
  controller ($scope, $stateParams, mqttService, devicesService, DEVICES_CONFIG) {
    var device = this.device
    var nestAPI
    var nestToken
    var nestPath

    $scope.$watch(() => {
      return device.sensors.state.numericValue
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
      var newState = (this.device.sensors.state.numericValue + 1) % 2
      this.device.sensors.state.numericValue = newState
      // The BRAINFUCK's IDIOT pair!
      this.device.update('lock', JSON.stringify({
        command: 'lock',
        option: newState
      }))

      updateImage()
      updateNest(newState)
    }

    function updateImage () {
      if ($scope.config !== undefined) {
        device.sensors.state.numericValue === 1 ? $scope.config.image = '/devices/images/smartlock-design_locked.png' : $scope.config.image = '/devices/images/smartlock-design_open.png'
      }
    }

    function updateNest (state) {
      if (nestAPI !== undefined) {
        nestAPI.child(nestPath).set((state === 1) ? 'away' : 'home')
      }
    }

    this.config = $scope.config = {}

    devicesService.getDeviceTemplates().then((templates) => {
      devicesService.getDevice($stateParams.id).then((d) => {
        mqttService.subscribe(d.channels[0].channel.split('/state')[0] + '/token', function (newValue) {
          if (newValue.token.stringValue !== undefined && newValue.token.stringValue !== '') {
            nestToken = newValue.token.stringValue

            nestAPI = new Firebase('wss://developer-api.nest.com')
            nestAPI.auth(nestToken)
            nestAPI.on('value', (snapshot) => {
              nestPath = 'structures/' + Object.keys(snapshot.val().structures)[0] + '/away'
            })
          }
        })

        $scope.config = DEVICES_CONFIG[templates[device.deviceTemplateId].name] || undefined
      })
    })
  }
}

module.exports = nestDisplayComponent
