const angular = require('angular')

const header = require('./header')
const loading = require('./loading')
const modal = require('./modal')
const bindHtmlCompileDirective = require('./bind-html-compile.directive')
const collpaseDirective = require('./collapse.directive')

const commonComponents = angular.module('simulator.common.components', [
  header,
  loading,
  modal
])
  .directive('bindHtmlCompile', bindHtmlCompileDirective)
  .directive('collapse', collpaseDirective)

module.exports = commonComponents
