'use strict';
module.exports = [
  '$http',
  function($http) {
    var urlBase = 'http://concaria-sms.herokuapp.com/api';
    var messageFactory = {};

    // there is only one sms service used for this app.
    // if we add more to the concaria-sms apilike "call",
    // then create another function called messageFactory.call that posts
    // to '/call'

    messageFactory.sendMessage = function(data) {
      return $http({
        url: '/api/proxy',
        method: 'POST',
        params: {
          'url': urlBase + '/message',
          'data': data,
        },
      });
    };

    return messageFactory;
  }
];