const angular = require('angular')
const boldchatComponent = require('./boldchat.component')

const boldchat = angular.module('simulator.common.components.boldchat', [])
  .component('boldchat', boldchatComponent)

module.exports = boldchat
