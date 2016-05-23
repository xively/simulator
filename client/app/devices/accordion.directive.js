/* @ngInject */
function accordion ($timeout) {
  return {
    restrict: 'A',
    scope: {
      isOpen: '='
    },
    link (scope, element, attrs) {
      const panel = element[0]

      scope.$watch('isOpen', function (isOpen) {
        if (isOpen) {
          panel.style.height = 'auto'
          const panelFullHeight = panel.offsetHeight
          panel.style.height = 0

          $timeout(function () {
            panel.style.height = `${panelFullHeight}px`
            panel.style['margin-top'] = '20px'
          }, 100)
        } else {
          panel.style.height = 0
          panel.style['margin-top'] = 0
        }
      })
    }
  }
}

module.exports = accordion
