'use strict';

var template = require('./template.tmpl');

module.exports = [function() {
  return {
    restrict: 'C',
    template: template,
    require: '^purifierMain',
    scope: false,
    controller: 'purifierDeviceCtrl',
  };
}];
