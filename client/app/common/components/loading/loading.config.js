/* @ngInject */
function loadingConfig ($httpProvider) {
  /* @ngInject */
  function loadingInterceptor ($injector) {
    return {
      request (request) {
        const $rootScope = $injector.get('$rootScope')
        $rootScope.$broadcast('simulator.loading', { loading: true })
        return request
      },

      response (response) {
        const $rootScope = $injector.get('$rootScope')
        $rootScope.$broadcast('simulator.loading', { loading: false })
        return response
      },

      responseError (response) {
        const $rootScope = $injector.get('$rootScope')
        $rootScope.$broadcast('simulator.loading', { loading: false })
        return response
      }
    }
  }

  $httpProvider.interceptors.push(loadingInterceptor)
}

module.exports = loadingConfig
