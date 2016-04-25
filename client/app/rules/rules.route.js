/* @ngInject */
function rulesRoute ($stateProvider) {
  $stateProvider.state('rules', {
    url: '/rules',
    template: '<rules-component></rules-component>'
  })
}

module.exports = rulesRoute
