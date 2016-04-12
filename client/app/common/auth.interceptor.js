/* @ngInject */
function authInterceptor ($log, $injector, $q, $timeout, CONFIG) {
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
        const authService = $injector.get('authService')
        // set authorization header
        return authService.getToken().then((token) => {
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
      const authService = $injector.get('authService')
      const $http = $injector.get('$http')
      if (response.status === 401) {
        $log.error('401 interceptor #responseError:', response)
        // delete old token
        authService.deleteToken()
        // resend the request in 2 seconds
        return $timeout(() => {
          return $http(response.config)
        }, 2000)
      }
      return $q.reject(response)
    }
  }
}

module.exports = authInterceptor
