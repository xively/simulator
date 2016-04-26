/* @ngInject */
function redirectToHabanero ($rootScope, $state, $window, CONFIG) {
  $rootScope.$on('$stateChangeStart', (event, to, params) => { // eslint-disable-line
    if (CONFIG.habanero.embedded && to.name.startsWith('rules')) {
      event.preventDefault()
      $window.open('/gotoHabanero', '_blank')
    }
  })
}

module.exports = redirectToHabanero
