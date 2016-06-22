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
        <button ng-click="switchState()">Switch to {{state == 'away' ? 'home' : 'away'}}</button>
      </div>
    </div>
  `,
  replace: true,
  bindings: {
    device: '='
  },
  contollerAs: 'nest',
  controller ($scope, $log) {
    const AWAY = 'away'
    const HOME = 'home'
    $scope.state = AWAY
    $scope.targetPath

    var accessToken = 'c.QBDi3jOvtmkYcPH8qBwZdY1sYhJBzSjR5Iq3tCim2qVGX6w98lXgTrVTN9RCNDlIxjCAf7LtS6us63laPuLWps7fbACwNwDQJEo648HG7VX0uzUxd9Xh0LYcFg7gnRhPdSLkwImm2J79c13M'

    /*global Firebase:true*/
    /*eslint no-undef: "error"*/
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
      $scope.targetPath = 'structures/' + Object.keys(snapshot.val().structures)[0] + '/away'

      $scope.safeApply(() => {
        console.log('got value: ' + state)
        $scope.state = state
      })
    })

    $scope.$watch('state', () => {
      console.log('hey2, myVar has changed!')
    })

    $scope.switchState = function () {
      var newState = $scope.state === AWAY ? HOME : AWAY
      $scope.state = newState
      ref.child($scope.targetPath).set(newState)
    }

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
  }
}

module.exports = nestComponent
