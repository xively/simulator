'use strict';

var template = require('./template.tmpl');

module.exports = [function() {
  return {
    restrict: 'E',
    template: template,
  };
}];
