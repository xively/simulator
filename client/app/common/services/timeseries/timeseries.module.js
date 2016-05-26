const timeseriesService = require('./timeseries.service')

const timeseries = angular.module('simulator.common.services.timeseries', [])
  .factory('timeseriesService', timeseriesService)

module.exports = timeseries
