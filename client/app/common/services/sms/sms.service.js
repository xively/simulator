/* @ngInject */
function smsFactory ($http, CONFIG) {
  return {
    send (phone, message) {
      return $http({
        url: CONFIG.smsService.url,
        method: 'POST',
        data: { phone, message }
      })
    }
  }
}

module.exports = smsFactory
