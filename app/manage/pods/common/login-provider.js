'use strict';

var Promise = require('bluebird');
var _ = require('lodash');

module.exports = [
  function() {
    var $scope = null;
    var jwtWatchers = [];

    var appOptions = {
      host: null,
      accountId: null,
    };

    this.options = function(_options) {
      return _.assign(appOptions, _options);
    };

    var slice = [].slice;

    var tryStorage = function(fn, errorMessage) {
      return function() {

        /* global localStorage:false */
        try {
          return fn.apply(null, [localStorage].concat(slice.call(arguments)));
        } catch (storageError) {
          console.error(errorMessage);
        }
      };
    };

    var storeToken = tryStorage(function(localStorage, jwt) {
      localStorage.loginToken = jwt;
    }, 'Unable to store login token.');

    var hasStoredToken = tryStorage(function(localStorage) {
      return 'loginToken' in localStorage;
    }, 'Unable to see if login token is stored.');

    var getStoredToken = tryStorage(function(localStorage) {
      return localStorage.loginToken;
    }, 'Unable to used stored login token.');

    var deleteStoredToken = tryStorage(function(localStorage) {
      delete localStorage.loginToken;
    }, 'Unable to unset stored login token.');

    this.$get = [
      '$http',
      '$rootScope',
      function($http, $rootScope) {

        // clear local storage to remove old token
        // super workaround, the login process is a mess
        if (localStorage) {
          localStorage.clear();
        }

        if (!$scope) {
          $scope = $rootScope.$new();
          $scope.jwt = null;
          $scope.$watch('jwt', function() {
            _.remove(jwtWatchers, function(fn) {
              return typeof fn() !== 'undefined';
            });
          });
        }

        return {

          token: function() {
            return Promise.resolve($scope.renewing)
            .then(function() {
              if ($scope.jwt && Date.now() - $scope.lastRenew > 10 * 60 * 1000) {
                return this.renew();
              }
            }.bind(this))
            // Resolve the chain if renew rejected. token() always resolves eventually, something else just
            // may need to successfully call login if renew fails.
            .catch(function() {})
            .then(function() {
              return new Promise(function(resolve) {
                if ($scope.jwt) {
                  return resolve();
                }

                jwtWatchers.push(function() {
                  if ($scope.jwt) {
                    resolve();
                    return false;
                  }
                });
              });
            })
            .then(function() {
              if (hasStoredToken() && getStoredToken() !== $scope.jwt) {
                $scope.jwt = getStoredToken();
              }
              return $scope.jwt;
            });
          },

          try: function(fn) {
            return this.token()
            .then(fn)
            .catch(this.renew)
            .then(this.token)
            .then(fn);
          },

          login: function(options) {
            var data = _.defaults(_.pick(options, ['emailAddress', 'password', 'accountId']), {
              accountId: appOptions.accountId,
            });
            return Promise.resolve($http.post(
              'https://' + (_.result(options, 'host') || appOptions.host) + '/api/v1/auth/login-user',
              data,
              {
                responseType: 'json',
              }
            ))
            .then(function(response) {
              if (response.data && response.data.jwt) {
                var jwt = response.data.jwt;
                storeToken(jwt);
                $scope.$apply(function() {
                  $scope.jwt = getStoredToken();
                  $scope.lastRenew = Date.now();
                });
                return $scope;
              }
              throw new Error('Invalid response received!');
            });
          },

          renew: function(options) {
            if ($scope.renewing) {
              return $scope.renewing
              .then(function() {
                if (!$scope.jwt) {
                  return this.renew(options);
                }
                return $scope;
              }.bind(this));
            }

            if (_.result(options, 'jwt') || $scope.jwt) {
              var _jwt = $scope.jwt;
              $scope.renewing = Promise.resolve(_.result(options, 'jwt') || $scope.jwt)
              .then(function(jwt) {
                var url = 'https://' +
                (_.result(options, 'host') || appOptions.host) +
                '/api/v1/sessions/renew-session';

                return $http({
                  method: 'POST',
                  url: url,
                  headers: {
                    Authorization: 'Bearer ' + jwt,
                  },
                })
                .catch(function(error) {
                  throw new Error(error.statusText, error);
                })
                .then(function(response) {
                  return {jwt: response.data.jwt};
                });
              })
              .then(function(state) {
                if ($scope.jwt === _jwt && (!hasStoredToken() || getStoredToken() === _jwt)) {
                  storeToken(state.jwt);
                }
                return getStoredToken();
              })
              .catch(function(error) {
                if ($scope.jwt === _jwt && (!hasStoredToken() || getStoredToken() === _jwt)) {
                  deleteStoredToken();
                  $scope.$apply(function() {
                    $scope.jwt = null;
                    $scope.lastRenew = 0;
                  });
                } else if ($scope.jwt === _jwt && hasStoredToken()) {
                  // Another renew, possibly in another window, succeeded before we tried to renew.
                  return getStoredToken();
                }
                throw error;
              })
              .then(function(token) {
                $scope.$apply(function() {
                  $scope.jwt = token;
                  $scope.lastRenew = Date.now();
                });
                return $scope;
              })
              .finally(function() {
                $scope.$apply(function() {
                  $scope.renewing = null;
                });
              });
              return $scope.renewing;
            }

            if (hasStoredToken()) {
              var jwt = getStoredToken();
              deleteStoredToken();
              return this.renew({jwt: jwt});
            }

            return Promise.reject(new Error('Not logged in'));
          },

        };

      },
    ];

  },
];
