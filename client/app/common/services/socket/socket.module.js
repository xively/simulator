const socketService = require('./socket.service')

const socket = angular.module('simulator.common.services.socket', [])
  .factory('socketService', socketService)

module.exports = socket
