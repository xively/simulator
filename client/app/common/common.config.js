/* @ngInject */
function commonConfig ($httpProvider, segmentProvider) {
  $httpProvider.interceptors.push('loadingInterceptor')
  $httpProvider.interceptors.push('authInterceptor')
}

module.exports = commonConfig
