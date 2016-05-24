// require('./modal.component.less')

const modalComponent = {
  template: `
    <div class="modal" ng-click="modal.close()" ng-show="modal.opened">
      <div class="scale">
        <div class="content modal-body" ng-click="modal.block($event)" ng-style="{'width': modal.width, 'height': modal.height}">
          <div class="modal-header">
            <div class="close" ng-click="modal.close()">✕</div>
          </div>
          <div class="modal-content" ng-transclude>

          </div>
        </div>
      </div>
    </div>
  `,
  transclude: true,
  controllerAs: 'modal',
  bindings: {
    name: '@',
    width: '@',
    height: '@'
  },
  /* @ngInject */
  controller (modalService, $element) {
    this.element = $element
    modalService.register(this)

    this.block = (event) => {
      event.stopPropagation()
    }
  }
}

module.exports = modalComponent
