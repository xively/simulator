/* @ngInject */
function settingsFactory ($log, $http) {
  return new class RulesService {
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
    }

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

    uploadImage (deviceImage) {
      return $http({
        method: 'POST',
        url: '/api/upload',
        data: { deviceImage }
      })
      .then((res) => res.data || {})
      .catch((err) => {
        $log.error('settingsService#uploadImage error:', err)
        throw err
      })
    }
  }
}

module.exports = settingsFactory
