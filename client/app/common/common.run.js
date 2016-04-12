/* @ngInject */
function redirectTo ($rootScope, $state) {
  $rootScope.$on('$stateChangeStart', (event, to, params) => { // eslint-disable-line
    if (to.redirectTo) {
      event.preventDefault()
      $state.go(to.redirectTo, params)
    }
  })
}

module.exports = redirectTo
