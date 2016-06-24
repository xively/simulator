/* @ngInject */
function redirectTo ($rootScope, $state, $location, segment, EVENTS, CONFIG) {
  segment.identify($location.host(), {
    accountId: CONFIG.account.accountId,
    emailAddress: CONFIG.account.emailAddress,
    idmUserId: CONFIG.account.idmUserId,
    blueprintUserId: CONFIG.account.blueprintUserId
  })

  segment.track(EVENTS.TRACKING.SIMULATOR_LOADED)

  $rootScope.$on('$stateChangeStart', (event, to, params) => { // eslint-disable-line
    if (to.redirectTo) {
      event.preventDefault()
      $state.go(to.redirectTo, params)
    }
  })
}

module.exports = redirectTo
