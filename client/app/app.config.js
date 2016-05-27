/* @ngInject */
function appConfig ($compileProvider, $logProvider, $provide, $urlRouterProvider, CONFIG) {
  let isProduction = false
  if (CONFIG.meta) {
    isProduction = CONFIG.meta.env === 'production'
  }
  $compileProvider.debugInfoEnabled(isProduction)
  $logProvider.debugEnabled(!isProduction)

  $urlRouterProvider.otherwise(($injector) => {
    const blueprintService = $injector.get('blueprintService')
    const $state = $injector.get('$state')

    blueprintService.getV1('devices', { pageSize: 2 }).then((response) => {
      const id = response.data.devices.results[1].id
<<<<<<< 47e3d9bd5dccf72fa67894778be9fa9e20fd47cc
      $state.transitionTo('mobile', { id })
=======
      $state.go('simulator', { id, header: 0 })
>>>>>>> refactor(app): virtual device & navigation
    })
  })
}

module.exports = appConfig
