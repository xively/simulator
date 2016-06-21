/* @ngInject */
function appConfig ($compileProvider, $logProvider, $provide, $urlRouterProvider, CONFIG, segmentProvider) {
  let isProduction = false
  if (CONFIG.meta) {
    isProduction = CONFIG.meta.env === 'production'
  }
  $compileProvider.debugInfoEnabled(isProduction)
  $logProvider.debugEnabled(!isProduction)


  segmentProvider
      .setKey(CONFIG.tracking.segmentKey)
      .setDebug(CONFIG.tracking.segmentDebugEnabled)
      .identify(window.location.host, {
        accountId: CONFIG.account.accountId,
        emailAddress: CONFIG.account.emailAddress,
        idmUserId: CONFIG.account.idmUserId,
        blueprintUserId: CONFIG.account.blueprintUserId,
      });
    
  $urlRouterProvider.otherwise(($injector) => {
    const blueprintService = $injector.get('blueprintService')
    const $state = $injector.get('$state')

    blueprintService.getV1('devices', { pageSize: 2 }).then((response) => {
      const id = response.data.devices.results[1].id
      $state.go('devices.device-demo', { id, header: 0 })
    })
  })
}

module.exports = appConfig
