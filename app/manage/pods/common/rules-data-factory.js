'use strict';
module.exports = [
  '$http',
  function($http) {
    var urlBase = '/api/rules';
    var dataFactory = {};

    dataFactory.getRules = function() {
      return $http.get(urlBase);
    };

    dataFactory.getRule = function(id) {
      return $http.get(urlBase + '/' + id);
    };

    dataFactory.insertUpdateRule = function(data, id) {
      if (id) {
        return $http.put(urlBase + '/' + id, data);
      }
      return $http.post(urlBase, data);
    };

    dataFactory.updateRule = function(data, id) {
      return $http.put(urlBase + '/' + id, data);
    };

    dataFactory.deleteRule = function(id) {
      return $http.delete(urlBase + '/' + id);
    };

    return dataFactory;
  }
];