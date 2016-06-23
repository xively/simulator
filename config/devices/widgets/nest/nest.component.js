require('./nest.component.less')

/* @ngInject */
const nestComponent = {
  template: `
    <div class="nest">
      <div ng-show="!nestConnected">
        <p>Connecting to nest...</p>
      </div>
      <div ng-show="nestConnected">
        <p>You are now {{state}}</p>
        <button ng-click="onSwitchClicked()">Switch to {{state == 'away' ? 'home' : 'away'}}</button>
      </div>
    </div>
  `,
  replace: true,
  bindings: {
    device: '='
  },
  contollerAs: 'nest',
  controller ($scope, $log, $stateParams, DEVICES_CONFIG, devicesService) {
    const AWAY = 'away'
    const HOME = 'home'
    const accessToken = 'c.or3oxSwZzGmMFuqpHqdHFfkyC3Qx636SpqgVBuTlOUXNTrKcxvhupFtFuJMf2F0FwPimlAbQrAiOm9hsHcf8IcQfGpAsPifEWFxq5zIxcUiAp4j6lblWRolAhrleeNLi2X4ftIYZXxrc0YHf'

    $scope.state = AWAY
    $scope.targetPath = undefined

    var ref = new Firebase('wss://developer-api.nest.com')
    ref.authWithCustomToken(accessToken, (err, authData) => {
      if (err) {
        console.log('Nest auth error: ' + err)
      } else {
        $scope.safeApply(() => {
          console.log('Successfully logged into NEST')
          $scope.nestConnected = true
        })
      }
    })

    ref.on('value', (snapshot) => {
      var state = snapshot.val().structures[Object.keys(snapshot.val().structures)[0]].away
      console.log('Got value from nest ' + state)

      $scope.targetPath = 'structures/' + Object.keys(snapshot.val().structures)[0] + '/away'

      $scope.safeApply(() => {
        $scope.state = state
      })
    })

    $scope.safeApply = function (fn) {
      var phase = this.$root.$$phase
      if (phase === '$apply' || phase === '$digest') {
        if (fn && (typeof (fn) === 'function')) {
          fn()
        }
      } else {
        this.$apply(fn)
      }
    }

    $scope.onSwitchClicked = function () {
      $scope.state = $scope.state === AWAY ? HOME : AWAY
    }

    $scope.$watch('state', (newValue, oldValue) => {
      if (newValue === oldValue) {
        console.log('initial state change, do nothing')
        return
      }

      console.log('state changed to ' + newValue)
      // Send new state to nest
      if ($scope.targetPath !== undefined) {
        console.log('Setting nest to ' + newValue)
        ref.child($scope.targetPath).set(newValue)
      }

      // Update image should go into other side's controller
      if ($scope.config !== undefined) {
        $scope.state === AWAY ? $scope.config.image = '/devices/images/smartlock-design_locked.png' : $scope.config.image = '/devices/images/smartlock-design_open.png'
      }

      // VISION
      // LOCK device writes nest only
      // MOBILE device reads nest and displays it's state
      // MQTT between LOCK and MOBILE
      // When MOBILE comes online, checks lock state in BP
      // Button on mobile device shows lock state
      // If lock state is not locked and mobile
      // receives an away state from nest
      // Notification pops up
    })

    // TODO with resolve like in device-demo-route.js
    const id = $stateParams.id
    this.config = $scope.config = {}

    devicesService.getDeviceTemplates().then((templates) => {
      devicesService.getDevice(id).then((device) => {
        device.template = templates[device.deviceTemplateId]
        $scope.config = DEVICES_CONFIG[device.template.name] || {}
        console.log($scope.config.image)
      })
    })
  }
}

module.exports = nestComponent
