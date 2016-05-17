const angular = require('angular')
const commonModule = require('../common')

const settingsService = require('./settings.service')
const settingsComponent = require('./settings.component')
const editorComponent = require('./editor.component')
const deviceFormComponent = require('./device-form.component')
const credentialsComponent = require('./credentials.component')
const deviceConfigComponent = require('./device-config.component')
const imageUploadComponent = require('./image-upload.component')
const tabsComponent = require('./tabs.component')
const tabComponent = require('./tab.component')

require('ng-tags-input')
require('brace')
require('brace/mode/json')
require('angular-ui-ace')

const settingsModule = angular.module('simulator.settings', [
  require('ng-file-upload'),
  'ui.ace',
  'ngTagsInput',
  commonModule
])
  .factory('settingsService', settingsService)
  .component('settings', settingsComponent)
  .component('editor', editorComponent)
  .component('deviceForm', deviceFormComponent)
  .component('credentials', credentialsComponent)
  .component('deviceConfig', deviceConfigComponent)
  .component('imageUpload', imageUploadComponent)
  .component('tabs', tabsComponent)
  .component('tab', tabComponent)

module.exports = settingsModule
