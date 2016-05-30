/* @ngInject */
function applicationConfigFactory ($log, $http) {
  return {
    get () {
      return $http({
        method: 'GET',
        url: '/api/application-config'
      })
      .then((res) => res.data || {})
      .catch((err) => {
        $log.error('applicationConfigService#get error:', err)
        throw err
      })
    },

    update (config) {
      return $http({
        method: 'PUT',
        url: '/api/application-config',
        data: config
      })
      .then((res) => res.data || {})
      .catch((err) => {
        $log.error('applicationConfigService#update error:', err)
        throw err
      })
    }
  }
}

module.exports = applicationConfigFactory
