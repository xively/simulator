require('./device-form.component.less')

const deviceFormComponent = {
  template: `
    <form novalidate>
      <div class="form-row">
        <label>Sensors</label>
        <tags-input ng-model="deviceForm.sensors"
          min-length="1"
          placeholder="Add sensor"
          replace-spaces-with-dashes="false">
        </tags-input>
      </div>
      <div class="form-row header" ng-if="deviceForm.sensors.length">
        <label></label>
        <div class="labels">
          <div class="label">Minimum</div>
          <div class="label">Maximum</div>
          <div class="label">Top [px]</div>
          <div class="label">Left [px]</div>
          <div class="label">Unit</div>
        </div>
      </div>
      <div class="form-row sensors" ng-repeat="sensor in deviceForm.sensors track by sensor.text">
        <label>{{ sensor.text }}</label>
        <div class="inputs">
            <input type="number" class="input-field" placeholder="Minimum" ng-model="sensor.min"/>
            <input type="number" class="input-field" placeholder="Maximum" ng-model="sensor.max"/>
            <input type="number" class="input-field" placeholder="Top [px]" ng-model="sensor.top"/>
            <input type="number" class="input-field" placeholder="Left [px]" ng-model="sensor.left"/>
            <input type="text" class="input-field" placeholder="Unit" ng-model="sensor.unit"/>
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
