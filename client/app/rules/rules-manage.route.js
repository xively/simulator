const _ = require('lodash')

require('./rules.less')

const rulesManageTemplate = `
  <div class="container">
    <header>
      <h1 class="title">{{rulesManage.title}}</h1>
    </header>

    <div class="content">
      <form>
        <input class="wide-input" type="text" placeholder="Name" ng-model="rulesManage.rule.name"/>

        <div>
          <h2 class="subtitle">Conditions</h2>
          <condition-list conditions="rulesManage.rule.conditions" templates="rulesManage.templates"></condition-list>
        </div>

        <div>
          <h2 class="subtitle">Actions</h2>
          <div class="actions">
            <div class="form-row">
              <label for="case">
                <input id="case" type="checkbox" ng-model="rulesManage.rule.actions.salesforceCase.enabled"/>
                <span>Create a salesforce case titled:</span>
                <input type="text" class="wide-input" ng-model="rulesManage.rule.actions.salesforceCase.value"/>
              </label>
            </div>

            <!-- <div class="form-row">
              <label for="opportunity">
                <input id="opportunity" type="checkbox" name='opportunity' value='true' ng-model='caseTypes.opportunity.selected'/>
                Create a salesforce opportunity titled:
                <input id="emailName" type="text" class="large-input" name="opportunityName" ng-model='caseTypes.opportunity.value'/>
              </label>
            </div>

            <div class="form-row">
              <label for="emailch">
                <input id="emailch" type="checkbox" name='emailch' value='true' ng-model='caseTypes.email.selected'/>
                Send email to:
                <input id="email" type="text" class="large-input" name="email" ng-model='caseTypes.email.value'/>
              </label>
            </div> -->
          </div>
        </div>

        <div>
          <button class="button primary" type="submit" ng-click="rulesManage.save()">Save</button>
          <button class="button" ui-sref="rules.list">Cancel</button>
        </div>
      </form>
    </div>
  </div>
`

function removeBlankLines (rule) {
  rule.conditions.rules = rule.conditions.rules.filter((rule) => rule.template)
  if (rule.conditions.additionalRules) {
    rule.conditions.additionalRules = rule.conditions.additionalRules.filter((rule) => rule.template)
  }
  return rule
}

function getDeviceTemplates (devicesService) {
  return devicesService.getDeviceTemplates()
    .then((templates) => {
      return _.map(templates, (template) => {
        if (template.channelTemplates) {
          template.channelTemplates.push({
            name: 'log:message',
            id: '_log'
          })
        }
        return {
          id: template.id,
          name: template.name,
          channels: template.channelTemplates
        }
      })
    })
}

/* @ngInject */
function rulesManageRoute ($stateProvider) {
  $stateProvider.state('rules.create', {
    url: '/create',
    template: rulesManageTemplate,
    controllerAs: 'rulesManage',
    resolve: {
      templates: (devicesService) => {
        return getDeviceTemplates(devicesService)
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
        rulesService.createRule(removeBlankLines(this.rule))
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
        return getDeviceTemplates(devicesService)
      }
    },
    controllerAs: 'rulesManage',
    controller ($state, $stateParams, rule, templates, rulesService) {
      this.title = 'Edit rule'
      this.templates = templates
      this.rule = rule

      this.save = () => {
        rulesService.updateRule($stateParams.ruleId, removeBlankLines(this.rule))
          .then(() => $state.go('rules.list'))
      }
    }
  })
}

module.exports = rulesManageRoute
