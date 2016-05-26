const angular = require('angular')

const boldchat = require('./boldchat')
const header = require('./header')
const loading = require('./loading')
const modal = require('./modal')
const qrcode = require('./qrcode')
const tabs = require('./tabs')

const bindHtmlCompileDirective = require('./bind-html-compile.directive')
const collpaseDirective = require('./collapse.directive')

const commonComponents = angular.module('simulator.common.components', [
  boldchat,
  header,
  loading,
  modal,
  qrcode,
  tabs
])
  .directive('bindHtmlCompile', bindHtmlCompileDirective)
  .directive('collapse', collpaseDirective)

module.exports = commonComponents
