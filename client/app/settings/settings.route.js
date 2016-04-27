/* @ngInject */
function settingsRoute ($stateProvider) {
  $stateProvider.state('settings', {
    url: '/settings',
    template: '<settings-component></settings-component>'
  })
}

module.exports = settingsRoute
