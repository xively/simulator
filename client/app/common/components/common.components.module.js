const angular = require('angular')

const boldchat = require('./boldchat')
const copy = require('./copy')
const headerBar = require('./header-bar')
const loading = require('./loading')
const modal = require('./modal')
const notification = require('./notification')
const qrcode = require('./qrcode')
const tabs = require('./tabs')

const bindHtmlCompileDirective = require('./bind-html-compile.directive')
const collpaseDirective = require('./collapse.directive')

const commonComponents = angular.module('simulator.common.components', [
  boldchat,
  copy,
  headerBar,
  loading,
  modal,
  notification,
  qrcode,
  tabs
])
  .directive('bindHtmlCompile', bindHtmlCompileDirective)
  .directive('collapse', collpaseDirective)

module.exports = commonComponents
