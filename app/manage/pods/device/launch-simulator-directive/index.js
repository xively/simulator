'use strict';

module.exports = [
  '$state',
  '$document',
  function($state, $document) {
    return {
      restrict: 'A',
      scope: {
        deviceId: '=launchSimulator',
      },
      link: function(scope, element) {
        function handleKeypress(event) {
          if (event.which === 83) {
            var url = $state.href('device.simulate', {
              ids: scope.deviceId,
            });
            window.open(url, 'simulator-window', 'width=940,height=500');
          }
        }
        element.on('$destroy', function() {
          $document.unbind('keypress', handleKeypress);
        });
        $document.bind('keypress', handleKeypress);
      },
    };
  },
];
