'use strict';

var _ = require('lodash');

module.exports = [
  '$stateProvider',
  function(stateProvider) {
    stateProvider
      .state('device', {
        url: '/:deviceId',
        template: require('./template.tmpl'),
        resolve: {
          devices: 'BlueprintDevices',
        },
        controller: [
          '$scope',
          '$stateParams',
          'devices',
          function($scope, $stateParams, devices) {
            var device = _.cloneDeep(_.find(devices, 'id', $stateParams.deviceId));
            $scope.device = device;
          },
        ],
      });
  },
];
