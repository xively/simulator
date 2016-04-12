/* @ngInject */
function bindHtmlCompile ($compile) {
  return {
    restrict: 'EA',
    link (scope, element, attrs) {
      scope.$watch(() => {
        return scope.$eval(attrs.bindHtmlCompile)
      }, (value) => {
        element.html(value)
        $compile(element.contents())(scope)
      })
    }
  }
}

module.exports = bindHtmlCompile
