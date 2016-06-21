/* @ngInject */
function redirectTo ($rootScope, $state, $location, segment, EVENTS) {

  //track if there's a mobile view (?navigation=0)
  if($location.search().navigation && $location.search().navigation == "0")
    segment.track(EVENTS.TRACKING.MOBILE_VIEW_LOADED);

  $rootScope.$on('$stateChangeStart', (event, to, params) => { // eslint-disable-line
    if (to.redirectTo) {
      event.preventDefault()
      $state.go(to.redirectTo, params)
    }
  })
}

module.exports = redirectTo
