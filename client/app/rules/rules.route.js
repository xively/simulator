require('./rules.less')
const _ = require('lodash')
const rulesTemplate = require('./rules.html')
const rulesManageTemplate = require('./rules.manage.html')

/* @ngInject */
function rulesRoute ($stateProvider) {
  $stateProvider.state('rules', {
    url: '/rules',
    redirectTo: 'rules.list',
    template: '<ui-view></ui-view>'
  })

  $stateProvider.state('rules.list', {
    url: '',
    template: rulesTemplate,
    resolve: {
      rules: (rulesService) => {
        return rulesService.getRules()
          .then((result) => result.data)
      }
    },
    controllerAs: 'rules',
    controller (rules, rulesService) {
      this.rules = rules

      this.removeRule = (ruleId) => {
        rulesService.removeRule(ruleId)
          .then(() => {
            rulesService.getRules()
              .then((result) => {
                this.rules = result.data
              })
          })
      }
    }
  })

  $stateProvider.state('rules.create', {
    url: '/create',
    template: rulesManageTemplate,
    controllerAs: 'rulesManage',
    resolve: {
      templates: (devicesService) => {
        return devicesService.getDeviceTemplates()
          .then((templates) => {
            return _.map(templates, (template) => {
              return {
                id: template.id,
                name: template.name,
                channels: template.channelTemplates
              }
            })
          })
      }
    },
    controller (templates, $state, rulesService) {
      this.title = 'New Rule'
      this.templates = templates
      this.rule = {
        name: '',
        conditions: {
          mode: 'all',
          rules: [{
            operator: '$eq',
            editing: false
          }],
          additionalRules: []
        },
        actions: {
          salesforceCase: {
            value: '',
            enabled: false
          }
        }
      }

      this.save = () => {
        rulesService.createRule(this.rule)
          .then(() => $state.go('rules.list'))
      }
    }
  })

  $stateProvider.state('rules.edit', {
    url: '/:ruleId',
    template: rulesManageTemplate,
    resolve: {
      rule: ($stateParams, rulesService) => {
        return rulesService.getRule($stateParams.ruleId)
          .then((result) => result.data.ruleConfig)
      },
      templates: (devicesService) => {
        return devicesService.getDeviceTemplates()
          .then((templates) => {
            return _.map(templates, (template) => {
              return {
                id: template.id,
                name: template.name,
                channels: template.channelTemplates
              }
            })
          })
      }
    },
    controllerAs: 'rulesManage',
    controller (rule, templates, $state, $stateParams, rulesService) {
      this.title = 'Edit rule'
      this.templates = templates
      this.rule = rule

      this.save = () => {
        rulesService.updateRule($stateParams.ruleId, this.rule)
          .then(() => $state.go('rules.list'))
      }
    }
  })
}

module.exports = rulesRoute
