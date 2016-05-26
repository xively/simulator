/* @ngInject */
function devicesRoute ($stateProvider) {
  $stateProvider.state('deviceList', {
    url: '/devices',
    template: '<device-list></device-list>'
  })
}

module.exports = devicesRoute
