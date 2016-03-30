'use strict';

module.exports = [
  function() {
    return {
      restrict: 'A',
      transclude: true,
      template: require('./template.tmpl'),
      scope: {
        sortProp: '@sortableHeader',
        sortBy: '=sortableSortBy',
        sortDesc: '=sortableSortDesc',
        sortChange: '&sortableClick',
      },
      link: function(scope) {
        // Handle click.
        scope.onclick = function() {
          var params = {};
          // A different header was previously selected.
          if (scope.sortBy !== scope.sortProp) {
            params.sortBy = scope.sortProp;
          } else {
            // The same header was clicked again.
            params.sortDesc = !scope.sortDesc;
          }
          scope.sortChange({params: params});
        };
      },
    };
  },
];
