const angular = require('angular')
const authorizationInterceptor = require('./authorization.interceptor')
const authorizationService = require('./authorization.service')

const authorization = angular.module('simulator.common.services.authorization', [])
  .factory('authorizationService', authorizationService)
  .factory('authorizationInterceptor', authorizationInterceptor)
  .config(/* @ngInject */ ($httpProvider) => {
    $httpProvider.interceptors.push('authorizationInterceptor')
  })

module.exports = authorization
