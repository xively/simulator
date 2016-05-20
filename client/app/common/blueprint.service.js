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

    updateDevice (id, data) {
      return this.getV1(`devices/${id}`)
        .then((resp) => {
          const diff = _.reduce(resp.data.device, (result, value, key) => {
            if (!_.isEqual(value, data[key]) && key !== 'version' && !_.isArray(value) && !_.isObject(value)) {
              result[key] = data[key]
            }

            return result
          }, {})

          return $http({
            method: 'PUT',
            url: `https://${CONFIG.account.blueprintHost}/api/v1/devices/${id}`,
            data: diff,
            headers: {
              Etag: resp.data.device.version,
              Accept: 'application/json'
            }
          })
        })
    }
  }
}

module.exports = blueprintFactory
