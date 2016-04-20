/* @ngInject */
function redirectToHabanero ($rootScope, $state, $window, CONFIG) {
  $rootScope.$on('$stateChangeStart', (event, to, params) => { // eslint-disable-line
    if (CONFIG.habanero.host && to.name.startsWith('rules')) {
      event.preventDefault()
      $window.open(CONFIG.habanero.host, '_blank')
    }
  })
}

module.exports = redirectToHabanero
