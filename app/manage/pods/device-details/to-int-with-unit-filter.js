'use strict';

module.exports = [
  '$sce',
  function($sce) {
    return function(input, unit) {
      var value = typeof input === 'undefined' ||
      input === null ||
      input === '' ? NaN : parseInt(input, 10);

      var retString = !isNaN(value) ?
      input.toString() + (unit || '') :
      'N/A';

      return $sce.trustAsHtml(retString);
    };
  },
];