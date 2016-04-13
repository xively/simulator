/* @ngInject */
function loadingInterceptor ($injector, EVENTS) {
  return {
    request (request) {
      const $rootScope = $injector.get('$rootScope')
      $rootScope.$broadcast(EVENTS.LOADING, { loading: true })
      return request
    },

    response (response) {
      const $rootScope = $injector.get('$rootScope')
      $rootScope.$broadcast(EVENTS.LOADING, { loading: false })
      return response
    },

    responseError (response) {
      const $rootScope = $injector.get('$rootScope')
      $rootScope.$broadcast(EVENTS.LOADING, { loading: false })
      return response
    }
  }
}

module.exports = loadingInterceptor
