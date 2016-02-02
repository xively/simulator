'use strict';

var BlueprintClient = require('../../../vendor/blueprint-client');
var Promise = require('bluebird');
var _ = require('lodash');

module.exports = [
  function() {

    var options = {
      accountId: null,
      host: null,
      jwt: null,
      loginService: null,
    };

    this.options = function(_options) {
      return _.assign(options, _options);
    };

    this.$get = [
      'Login',
      function(Login) {
        var clientOptions = _.assign({}, options, {loginService: Login});

        return Promise.resolve()
        .then(function() {
          var jwt = clientOptions.jwt;
          if (clientOptions.loginService) {
            jwt = clientOptions.loginService.token();
          }
          return jwt;
        })
        .then(function(jwt) {
          var client = new BlueprintClient({
            authorization: 'Bearer ' + jwt,
            docsUrl: 'https://' + clientOptions.host + '/docs',
          });

          return Promise.props({
            client: client.ready,

            call: function(api, params, callOptions) {
              var apiSplit = api.split('.');
              var endpoint = apiSplit[0];
              var method = apiSplit[1];

              if (!params) {
                params = {};
              }

              if (method === 'create' || method === 'udpate') {
                if (!params.body) {
                  params = {body: params};
                }
                if (typeof params.body === 'object') {
                  if (!params.body.accountId) {
                    params.body.accountId = clientOptions.accountId;
                  }
                  params.body = JSON.stringify(params.body);
                }
              }
              else if (!params.accountId) {
                params.accountId = clientOptions.accountId;
              }

              var _client = this.client;
              var methodFn = _client.apis[endpoint][method].bind(_client.apis[endpoint], params, callOptions);
              return methodFn()
              .catch(function(error) {
                if (clientOptions.loginService) {
                  return clientOptions.loginService.renew()
                  .then(clientOptions.loginService.token)
                  .then(function(token) {
                    _client.setAuthorization(token);
                    return methodFn();
                  })
                  .catch(function() {
                    throw error;
                  });
                }
                throw error;
              });
            },
          });
        });
      },
    ];

  },
];
