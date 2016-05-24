const angular = require('angular')
const modalService = require('./modal.service')
const modalComponent = require('./modal.component')

const modal = angular.module('simulator.common.components.modal', [])
  .factory('modalService', modalService)
  .component('modal', modalComponent)

module.exports = modal
