/* @ngInject */
function authorizationInterceptor ($log, $injector, $q, $timeout, CONFIG) {
  return {
    /**
     * Request interceptor
     * Add authorization token to blueprint requests
     * @param  {Object} request
     * @return {Promise}
     */
    request (request) {
      $log.debug('HTTP request:', request)
      // if we make a request to blueprint
      if (request.url.includes(CONFIG.account.blueprintHost) ||
          request.url.includes(CONFIG.account.timeSeriesHost)) {
        const authorizationService = $injector.get('authorizationService')
        // set authorization header
        return authorizationService.getToken().then((token) => {
          request.headers.Authorization = `Bearer ${token}`
          return request
        })
      }
      return request
    },

    /**
     * Response error interceptor
     * On 401 Unauthorized status delete current token
     * and resend the request in 2 seconds
     * @param  {Object} response
     * @return {Promise}
     */
    responseError (response) {
      const authorizationService = $injector.get('authorizationService')
      const $http = $injector.get('$http')
      if (response.status === 401) {
        $log.error('401 interceptor #responseError:', response)
        // delete old token
        authorizationService.deleteToken()
        // resend the request in 2 seconds
        return $timeout(() => {
          return $http(response.config)
        }, 2000)
      }
      return $q.reject(response)
    }
  }
}

module.exports = authorizationInterceptor
