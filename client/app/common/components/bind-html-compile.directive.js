/* @ngInject */
function bindHtmlCompile ($compile) {
  return {
    restrict: 'A',
    link (scope, element, attributes) {
      scope.$watch(() => {
        return scope.$eval(attributes.bindHtmlCompile)
      }, (value) => {
        element.html(value)
        $compile(element.contents())(scope)
      })
    }
  }
}

module.exports = bindHtmlCompile
