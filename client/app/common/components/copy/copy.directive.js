require('./copy.directive.less')

/* @ngInject */
function copy ($document, $timeout) {
  return {
    restrict: 'A',
    scope: {
      copy: '<'
    },
    link (scope, element, attributes) {
      const el = angular.element(element[0])
      const doc = $document[0]

      element.bind('click', () => {
        const node = doc.createElement('textarea')
        node.textContent = scope.copy
        doc.body.appendChild(node)
        const selection = doc.getSelection()
        selection.removeAllRanges()
        node.select()
        if (doc.execCommand('copy')) {
          el.addClass('copying')
        }
        selection.removeAllRanges()
        doc.body.removeChild(node)

        $timeout(() => {
          el.removeClass('copying')
        }, 500)
      })
    }
  }
}

module.exports = copy
