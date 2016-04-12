const _ = require('lodash')

/* @ngInject */
function blueprintFactory ($log, $http, CONFIG) {
  return new class Blueprint {
    constructor () {
      this.accountId = CONFIG.account.accountId
    }

    /**
     * GET resource
     * @param  {String} resource
     * @param  {Object?} params
     * @return {Promise} HTTP response
     */
    getV1 (resource, params = {}) {
      _.assign(params, { accountId: this.accountId })
      return $http({
        method: 'GET',
        url: `https://${CONFIG.account.blueprintHost}/api/v1/${resource}`,
        params,
        headers: {
          Accept: 'application/json'
        }
      })
    }
  }
}

module.exports = blueprintFactory
