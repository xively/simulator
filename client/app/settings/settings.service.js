/* @ngInject */
function settingsFactory ($log, $http) {
  return new class RulesService {
    /**
     * Get device config
     */
    getDeviceConfig () {
      return $http({
        method: 'GET',
        url: '/api/device-config'
      })
      .then((res) => res.data.deviceConfig || {})
      .catch((err) => {
        $log.error('settingsService#getDeviceConfig error:', err)
        throw err
      })
    }

    /**
     * Update device config
     */
    updateDeviceConfig (deviceConfig) {
      return $http({
        method: 'PUT',
        url: '/api/device-config',
        data: deviceConfig
      })
      .then((res) => res.data.deviceConfig || {})
      .catch((err) => {
        $log.error('settingsService#updateDeviceConfig error:', err)
        throw err
      })
    }

    getOriginalDeviceConfig () {
      return $http({
        method: 'GET',
        url: '/api/device-config/original'
      })
      .then((res) => res.data || {})
      .catch((err) => {
        $log.error('settingsService#getOriginalDeviceConfig error:', err)
        throw err
      })
    }
  }
}

module.exports = settingsFactory
