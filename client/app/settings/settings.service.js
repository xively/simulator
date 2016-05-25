/* @ngInject */
function settingsFactory ($log, $http, utils) {
  const service = {
    /**
     * Update device config
     */
    updateDeviceConfig (templateName, config) {
      return $http({
        method: 'PUT',
        url: '/api/device-config',
        data: config,
        params: { templateName }
      })
      .then((res) => res.data.config || {})
      .catch((err) => {
        $log.error('settingsService#updateDeviceConfig error:', err)
        throw err
      })
    },

    getOriginalDeviceConfig (templateName) {
      return $http({
        method: 'GET',
        url: '/api/device-config/original',
        params: { templateName }
      })
      .then((res) => res.data || {})
      .catch((err) => {
        $log.error('settingsService#getOriginalDeviceConfig error:', err)
        throw err
      })
    }
  }

  service.updateDeviceConfigDebounce = utils.debounce(service.updateDeviceConfig.bind(service), 500)

  return service
}

module.exports = settingsFactory
