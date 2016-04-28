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
      }).catch((err) => {
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
      }).catch((err) => {
        $log.error('settingsService#updateDeviceConfig error:', err)
        throw err
      })
    }
  }
}

module.exports = settingsFactory
