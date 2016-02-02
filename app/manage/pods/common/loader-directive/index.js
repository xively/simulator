'use strict';

module.exports = [
  function() {
    return {
      scope: {
        tiny: '@',
      },
      template: require('./template.tmpl'),
    };
  },
];
