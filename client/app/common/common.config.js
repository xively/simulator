/* @ngInject */
function commonConfig ($httpProvider, segmentProvider, CONFIG) {
  segmentProvider
  .setKey(CONFIG.tracking.segmentKey)
  .setDebug(CONFIG.tracking.segmentDebugEnabled)

  $httpProvider.interceptors.push('loadingInterceptor')
  $httpProvider.interceptors.push('authInterceptor')
}

module.exports = commonConfig
