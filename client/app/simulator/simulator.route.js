/* @ngInject */
function simulatorRoute ($stateProvider) {
  $stateProvider.state('simulator', {
    url: '/devices/:deviceId',
    template: ''
  })
}

module.exports = simulatorRoute
