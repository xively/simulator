/* @ngInject */
function commonConfig ($httpProvider, CONFIG) {
  $httpProvider.interceptors.push('loadingInterceptor')
  $httpProvider.interceptors.push('authInterceptor')
}

module.exports = commonConfig
