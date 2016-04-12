/* @ngInject */
function rulesFactory ($log, $http) {
  return new class RulesService {
    /**
     * Get all rules
     */
    getRules () {
      return $http({
        method: 'GET',
        url: '/api/rules'
      }).catch((err) => {
        $log.error('rulesService#getRules error:', err)
        throw err
      })
    }

    /**
     * Get a rule by id
     * @param {String} rule id
     */
    getRule (ruleId) {
      return $http({
        method: 'GET',
        url: `/api/rules/${ruleId}`
      }).catch((err) => {
        $log.error('rulesService#getRule error:', err)
        throw err
      })
    }

    /**
     * Save rule to the database
     * @param {Object} rule
     */
    createRule (rule) {
      return $http({
        method: 'POST',
        url: '/api/rules',
        data: rule
      }).catch((err) => {
        $log.error('rulesService#createRule error:', err)
        throw err
      })
    }

    /**
     * Update rule in the database
     * @param {Object} rule
     */
    updateRule (ruleId, ruleConfig) {
      return $http({
        method: 'PUT',
        url: `/api/rules/${ruleId}`,
        data: ruleConfig
      }).catch((err) => {
        $log.error('rulesService#updateRule error:', err)
        throw err
      })
    }

    /**
     * Remove rule from the database
     * @param {String} rule id
     */
    removeRule (ruleId) {
      return $http({
        method: 'DELETE',
        url: `/api/rules/${ruleId}`
      }).catch((err) => {
        $log.error('rulesService#removeRule error:', err)
        throw err
      })
    }
  }
}

module.exports = rulesFactory
