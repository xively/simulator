require('./condition-list.less')
const template = require('./condition-list.html')
const _ = require('lodash')

/* @ngInject */
const conditionListComponent = {
  template,
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

    this.addAdditionalCombination = () => this.conditions.additionalRules.push({
      mode: 'any',
      rules: [_.clone(ruleTemplate)]
    })
    this.removeCombination = (index) => this.conditions.additionalRules.splice(index, 1)
    this.addRule = (array) => array.push(_.clone(ruleTemplate))
    this.deleteRule = (index) => this.conditions.rules.splice(index, 1)
    this.editRule = (array, index) => {
      array[index].editing = !array[index].editing
    }
  }
}

module.exports = conditionListComponent
