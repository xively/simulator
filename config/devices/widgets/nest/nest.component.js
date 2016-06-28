require('./nest.component.less')

/* @ngInject */
const nestComponent = {
  template: `
    <div class="nest">
      <div ng-show="!nestConnected">
        <button ng-click="requestPIN()">Request Nest PIN</button><br>
        Please enter the requested PIN in the text field below and click on Login
        <input type="text" ng-model="token"/><br>
        <button ng-click="loginToNest()">Login</button><br>
      </div>
      <div ng-show="nestConnected">
        <p>You are now {{nestState}}</p>
        <button ng-click="onSwitchClicked()">{{lockState == 'lock' ? 'unlock' : 'lock'}} your lock</button>
      </div>
    </div>
  `,
  replace: true,
  bindings: {
    device: '='
  },
  contollerAs: 'nest',
  controller ($scope, $http) {
    // VISION
    // LOCK device writes nest only
    // MOBILE device reads nest and displays it's state
    // MQTT between LOCK and MOBILE
    // When MOBILE comes online, checks lock state in BP
    // Button on mobile device shows lock state
    // If lock state is not locked and mobile
    // receives an away state from nest
    // Notification pops up

    const AWAY = 'away'
    const HOME = 'home'
    const LOCKED = 'lock'
    const UNLOCKED = 'unlock'

    $scope.nestState = AWAY
    $scope.lockState = LOCKED
    $scope.targetPath = undefined
    $scope.token = ''
    $scope.nestConnected = false

    var device = this.device

    // eslint-disable-next-line no-use-before-define
    var ref = new Firebase('wss://developer-api.nest.com')

    $scope.requestPIN = () => {
      window.open('https://home.nest.com/login/oauth2?client_id=a8ceb621-1086-45e3-8f56-ffabba69017c&state=STATE', '_blank')
    }

    $scope.loginToNest = () => {
      var parameters = {
        'code': $scope.token,
        'client_id': 'a8ceb621-1086-45e3-8f56-ffabba69017c',
        'client_secret': '7DB5XhoNOx9G5NpebEoV4WZ7b',
        'grant_type': 'authorization_code'
      }

      $http({
        method: 'POST',
        url: '/nestpin',
        data: parameters
      }).then(
        (response) => {
          console.log('response:', response, response.data)
          if (response.status === 200) {
            ref.authWithCustomToken(response.data.access_token, (err, authData) => {
              if (err) {
                console.log('Nest auth error: ' + err)
              } else {
                $scope.safeApply(() => {
                  console.log('Successfully logged into NEST')
                  $scope.nestConnected = true
                  // TODO send token to lock
                })
              }
            })
          }
        },
        (response) => {
          console.log('ERROR ' + response)
        })
    }

    ref.on('value', (snapshot) => {
      // Reading nest changes
      var state = snapshot.val().structures[Object.keys(snapshot.val().structures)[0]].away
      console.log('Got value from nest ' + state)

      $scope.targetPath = 'structures/' + Object.keys(snapshot.val().structures)[0] + '/away'

      $scope.safeApply(() => {
        // apply change on the UI
        $scope.nestState = state
      })

      // 0 means that the lock is unlocked
      // 1 means that the lock is pointerLockElement
      if (state === AWAY && $scope.lockState === UNLOCKED) {
        // TODO notify user that he forgot to lock the door
      } else if (state === HOME && $scope.lockState === LOCKED) {
        // TODO notify user of bulglar
      }
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

    // Let's watch on lock state changes
    $scope.$watch(() => {
      return this.device.sensors.state.numericValue
    }, (newValue) => {
      // This handles lock state change
      // 0 means that the lock is unlocked
      // 1 means that the lock is locked
      // apply state change on UI
      $scope.lockState = newValue === 0 ? UNLOCKED : LOCKED
    })

    // Button clicked
    $scope.onSwitchClicked = function () {
      // Send lock message
      var newState = $scope.lockState === LOCKED ? 0 : 1
      console.log('Setting new state to: ' + newState)
      device.sensors.state.numericValue = newState
      // BRAINFUCK!
      device.update('lock', JSON.stringify({
        command: 'lock',
        option: newState
      }))
    }
  }
}

module.exports = nestComponent
