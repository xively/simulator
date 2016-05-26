/* @ngInject */
function timeseriesFactory ($log, $http, CONFIG) {
  return {
    /**
     * GET resource
     * @param  {String} resource
     * @param  {Object?} params
     * @return {Promise} HTTP response
     */
    getV4 (resource, params = {}) {
      return $http({
        method: 'GET',
        url: `https://${CONFIG.account.timeSeriesHost}/api/v4/${resource}`,
        params,
        headers: {
          Accept: 'application/json'
        }
      })
    }
  }
}

module.exports = timeseriesFactory
