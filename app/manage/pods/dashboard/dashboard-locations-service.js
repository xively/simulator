'use strict';

module.exports = [
  'BlueprintClient',
  function(BlueprintClient) {
    return BlueprintClient
    .then(function(blueprint) {
      return blueprint.call('organizations.all');
    })
    .then(function(response) {
      return response.obj.organizations.results;
    });
  },
];
