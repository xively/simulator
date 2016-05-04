/* @ngInject */
function loginFactory ($log, $http, $timeout, $q, CONFIG) {
  // private
  const TOKEN_KEY = 'simulator.token'
  const ACCOUNT_ID_KEY = 'simulator.account_id'

  // public
  return {
    /**
     * Save token to Local Storage
     * @param {String} token
     */
    setToken (token) {
      try {
        localStorage.setItem(TOKEN_KEY, token)
        localStorage.setItem(ACCOUNT_ID_KEY, CONFIG.account.accountId)
      } catch (ex) {}
    },

    /**
     * Get token from Local Storage or request a new one
     * @return {Promise}
     */
    getToken () {
      const savedToken = localStorage.getItem(TOKEN_KEY)
      const accountId = localStorage.getItem(ACCOUNT_ID_KEY)
      if (savedToken && accountId === CONFIG.account.accountId) {
        return $q.resolve(savedToken)
      }
      return this.newToken()
        .then((token) => {
          this.setToken(token)
          return token
        })
    },

    /**
     * Request a new token from IDM
     * @return {Promise}
     */
    newToken () {
      return $http({
        method: 'POST',
        url: `https://${CONFIG.account.idmHost}/api/v1/auth/login-user`,
        data: {
          emailAddress: CONFIG.account.emailAddress,
          password: CONFIG.account.password,
          accountId: CONFIG.account.accountId
        }
      }).then((response) => {
        $log.debug('authService#newToken response:', response)
        if (response.status === 200) {
          return response.data.jwt
        }

        throw new Error(response.message)
      }).catch((err) => {
        $log.error('authService#newToken error:', err)
        throw err
      })
    },

    /**
     * Delete token from Local Storage
     */
    deleteToken () {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(ACCOUNT_ID_KEY)
    }
  }
}

module.exports = loginFactory
