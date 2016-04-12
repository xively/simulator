require('./iphone-frame.component.less')

const iphoneFrameComponent = {
  template: `
    <div class="iphone-frame-wrapper mobile" ng-transclude>
    </div>
  `,
  transclude: true
}

module.exports = iphoneFrameComponent
