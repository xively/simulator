require('./device-form.component.less')

const deviceFormComponent = {
  template: `
    <form novalidate>
      <div class="form-row">
        <label>Image URL</label>
        <input type="text" class="input-field" ng-model="deviceForm.image"/>
      </div>
      <div class="form-row">
        <label>Image width</label>
        <input type="text" class="input-field" ng-model="deviceForm.width"/>
      </div>
      <div class="form-row">
        <label>Sensors</label>
        <tags-input ng-model="deviceForm.sensors"
          min-length="1"
          placeholder="Add sensor"
          replace-spaces-with-dashes="false">
        </tags-input>
        <div>
          <span>
            <small>Please enter the names of the desired sensors. Press enter to set each name.</small>
          </span>
        </div>
      </div>
    </form>
  `,
  controllerAs: 'deviceForm',
  bindings: {
    update: '&',
    image: '=',
    width: '=',
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
