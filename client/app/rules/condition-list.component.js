const _ = require('lodash')

require('./condition-list.less')

/* @ngInject */
const conditionListComponent = {
  template: `
    <div class="condition-container">
      <div class="condition-block">
        <div class="mode-selector">
          if
          <select ng-model="conditionList.conditions.mode">
            <option>all</option>
            <option>any</option>
          </select>
          conditions are true
        </div>

        <div class="condition-row" ng-repeat="rule in conditionList.conditions.rules">
          <select class="min-width"
            ng-disabled="!rule.editing"
            ng-model="rule.template"
            ng-options="template.name for template in conditionList.templates track by template.id"
            ></select>
          <select class="min-width"
            ng-disabled="!rule.editing"
            ng-model="rule.channel"
            ng-options="channel.name for channel in rule.template.channels track by channel.id"
            ></select>
          <select class="min-width" ng-disabled="!rule.editing" ng-model="rule.operator">
            <option value="$lt"> &lt; </option>
            <option value="$lte">&lt;=</option>
            <option value="$gt">&gt;</option>
            <option value="$gte">&gt;=</option>
            <option value="$eq">=</option>
            <option value="$in">Contains</option>
            <option value="$nin">Doesn't contain</option>
          </select>
          <input type="text" ng-disabled="!rule.editing" ng-model="rule.value" placeholder="value"/>
          <button class="button secondary-outline"
            ng-class="{active: rule.editing}"
            ng-click="conditionList.editRule(conditionList.conditions.rules, $index)">
            Edit
          </button>
          <button class="button delete-outline" ng-click="conditionList.deleteRule(conditionList.conditions.rules, $index)">
            Remove
          </button>
        </div>

        <div class="condition-row">
          <select class="min-width"
            ng-model="conditionList.newRule.template"
            ng-options="template.name for template in conditionList.templates track by template.id"
            ></select>
          <select class="min-width"
            ng-disabled="!conditionList.newRule.template"
            ng-model="conditionList.newRule.channel"
            ng-options="channel.name for channel in conditionList.newRule.template.channels track by channel.id"
            ></select>
          <select class="min-width" ng-model="conditionList.newRule.operator">
            <option value="$lt"> &lt; </option>
            <option value="$lte">&lt;=</option>
            <option value="$gt">&gt;</option>
            <option value="$gte">&gt;=</option>
            <option value="$eq">=</option>
            <option value="$in">Contains</option>
            <option value="$nin">Doesn't contain</option>
          </select>
          <input type="text" ng-model="conditionList.newRule.value" placeholder="value"/>
          <button class="button primary-outline" type="submit"
            ng-click="conditionList.addRule()"
            ng-disabled="!conditionList.newRule.template || !conditionList.newRule.channel || !conditionList.newRule.value">
            + Add
          </button>
        </div>
      </div>

      <div class="condition-container" ng-repeat="condition in conditionList.conditions.additionalRules">
        <div class="mode-selector">
          if
          <select ng-model="condition.mode">
            <option>all</option>
            <option>any</option>
          </select>
          conditions are true
        </div>

        <div class="condition-row" ng-repeat="rule in condition.rules">
          <select class="min-width"
            ng-disabled="!rule.editing"
            ng-model="rule.template"
            ng-options="template.name for template in conditionList.templates track by template.id"
            ></select>
          <select class="min-width"
            ng-disabled="!rule.editing"
            ng-model="rule.channel"
            ng-options="channel.name for channel in rule.template.channels track by channel.id"
            ></select>
          <select class="min-width" ng-disabled="!rule.editing" ng-model="rule.operator">
            <option value="$lt"> &lt; </option>
            <option value="$lte">&lt;=</option>
            <option value="$gt">&gt;</option>
            <option value="$gte">&gt;=</option>
            <option value="$eq">=</option>
            <option value="$in">Contains</option>
            <option value="$nin">Doesn't contain</option>
          </select>
          <input type="text" ng-disabled="!rule.editing" ng-model="rule.value" placeholder="value"/>
          <button class="button secondary-outline"
            ng-class="{active: rule.editing}"
            ng-click="conditionList.editRule(condition.rules, $index)">
            Edit
          </button>
          <button class="button delete-outline" ng-click="conditionList.deleteRule(condition.rules, $index)">
            Remove
          </button>
        </div>

        <div class="condition-row">
          <select class="min-width"
            ng-model="conditionList.newAdditionalRules[$index].template"
            ng-options="template.name for template in conditionList.templates track by template.id"
            ></select>
          <select class="min-width"
            ng-disabled="!conditionList.newAdditionalRules[$index].template"
            ng-model="conditionList.newAdditionalRules[$index].channel"
            ng-options="channel.name for channel in conditionList.newAdditionalRules[$index].template.channels track by channel.id"
            ></select>
          <select class="min-width" ng-model="conditionList.newAdditionalRules[$index].operator">
            <option value="$lt"> &lt; </option>
            <option value="$lte">&lt;=</option>
            <option value="$gt">&gt;</option>
            <option value="$gte">&gt;=</option>
            <option value="$eq">=</option>
            <option value="$in">Contains</option>
            <option value="$nin">Doesn't contain</option>
          </select>
          <input type="text" ng-model="conditionList.newAdditionalRules[$index].value" placeholder="value"/>
          <button class="button primary-outline" type="submit"
            ng-click="conditionList.addAdditionalRule($index)"
            ng-disabled="!conditionList.newAdditionalRules[$index].template || !conditionList.newAdditionalRules[$index].channel || !conditionList.newAdditionalRules[$index].value">
            + Add
          </button>
        </div>

        <div>
          <button class="button delete-outline" ng-click="conditionList.removeCombination($index)">Remove combination</button>
        </div>
      </div>

      <div class="condition-container">
        <button class="button primary-outline" type="submit"
          ng-click="conditionList.addAdditionalCombination()">
          + Add Combination
        </button>
      </div>
    </div>
  `,
  controllerAs: 'conditionList',
  bindings: {
    conditions: '=',
    templates: '<'
  },
  /* @ngInject */
  controller (devicesService) {
    const ruleTemplate = {
      operator: '$eq',
      editing: false
    }

    this.newAdditionalRules = []

    this.newRule = _.clone(ruleTemplate)
    this.addRule = () => {
      this.conditions.rules.push(_.clone(this.newRule))
      this.newRule = _.clone(ruleTemplate)
    }

    this.addAdditionalCombination = () => {
      this.conditions.additionalRules.push({
        mode: 'any',
        rules: []
      })
      this.newAdditionalRules.push(_.clone(ruleTemplate))
    }

    this.addAdditionalRule = (idx) => {
      const newRule = _.clone(this.newAdditionalRules[idx])
      this.conditions.additionalRules[idx].rules.push(newRule)
      this.newAdditionalRules[idx] = _.clone(ruleTemplate)
    }

    this.removeCombination = (idx) => {
      this.conditions.additionalRules.splice(idx, 1)
      this.newAdditionalRules.rules.splice(idx, 1)
    }

    this.deleteRule = (array, idx) => array.splice(idx, 1)

    this.editRule = (array, idx) => {
      array[idx].editing = !array[idx].editing
    }
  }
}

module.exports = conditionListComponent
