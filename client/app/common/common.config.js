/* @ngInject */
function commonConfig ($httpProvider, CONFIG) {
  $httpProvider.interceptors.push('loadingInterceptor')
}

module.exports = commonConfig
