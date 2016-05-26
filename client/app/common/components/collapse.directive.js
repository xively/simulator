/* @ngInject */
function collapse ($timeout) {
  return {
    restrict: 'A',
    scope: {
      isOpen: '<',
      triggerResize: '<'
    },
    link (scope, element, attrs) {
      const panel = element[0]

      scope.$watch('triggerResize', function (triggerResize) {
        panel.style.height = 'auto'

        $timeout(function () {
          panel.style.height = `${panel.offsetHeight}px`
        }, 100)
      })

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

module.exports = collapse
