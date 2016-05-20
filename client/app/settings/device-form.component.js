require('./device-form.component.less')

const deviceFormComponent = {
  template: `
    <form novalidate>
      <div class="form-row">
        <label>Image URL</label>
        <div class="input-field">
          <input type="text" ng-model="deviceForm.image"/>
        </div>
      </div>
      <div class="form-row">
        <label>Sensors</label>
        <tags-input ng-model="deviceForm.sensors"
          min-length="1"
          placeholder="Add sensor"
          replace-spaces-with-dashes="false">
        </tags-input>
      </div>
      <div class="form-row" ng-repeat="sensor in deviceForm.sensors track by sensor.text">
        <label>{{ sensor.text }}</label>
        <div class="inputs">
          <div class="floating-label-group">
            <input type="number" class="input-field" ng-model="sensor.min"/>
            <div class="label">Minimum</div>
          </div>
          <div class="floating-label-group">
            <input type="number" class="input-field" ng-model="sensor.max"/>
            <div class="label">Maximum</div>
          </div>
          <div class="floating-label-group">
            <input type="number" class="input-field" ng-model="sensor.top"/>
            <div class="label">Top [px]</div>
          </div>
          <div class="floating-label-group">
            <input type="number" class="input-field" ng-model="sensor.left"/>
            <div class="label">Left [px]</div>
          </div>
        </div>
      </div>
    </form>
  `,
  controllerAs: 'deviceForm',
  bindings: {
    update: '&',
    image: '=',
    sensors: '='
  },
  /* @ngInject */
  controller ($scope) {
    $scope.$watch(() => this, () => {
      this.update({deviceForm: this})
    }, true)
  }
}

module.exports = deviceFormComponent
