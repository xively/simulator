/* @ngInject */
function appConfig ($compileProvider, $logProvider, $provide, $urlRouterProvider, CONFIG) {
  let isProduction = false
  if (CONFIG.meta) {
    isProduction = CONFIG.meta.env === 'production'
  }
  $compileProvider.debugInfoEnabled(isProduction)
  $logProvider.debugEnabled(!isProduction)

  $urlRouterProvider.otherwise('devices')
}

module.exports = appConfig
