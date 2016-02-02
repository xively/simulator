'use strict';

// This could be stored in a separate service if we need to
// reuse it, but for now it'll go here.
var AQI_DOMAIN = 'https://concaria-app-xperience-0.herokuapp.com';

var aqiResource = ['$resource', function($resource) {
  return $resource(AQI_DOMAIN + '/api/aqi/history');
}];

module.exports = aqiResource;
