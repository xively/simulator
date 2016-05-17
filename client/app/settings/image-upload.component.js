require('./image-upload.component.less')

/* @ngInject */
const imageUploadComponent = {
  template: `
    <div ngf-select ngf-change="imageUpload.uploadImage()" ngf-accept="'image/*'"
      class="upload-field" ng-model="imageUpload.newFile" accept="image/*">
      <img class="thumbnail" ng-show="imageUpload.image" ng-src="{{imageUpload.image}}" />
    </div>
    <small>Click to upload image.</small>
  `,
  controllerAs: 'imageUpload',
  bindings: {
    image: '='
  },
  /* @ngInject */
  controller (settingsService, Upload) {
    this.uploadImage = () => {
      Upload.base64DataUrl(this.newFile)
        .then(settingsService.uploadImage)
        .then((response) => {
          this.image = response.imageUrl
        })
    }
  }
}

module.exports = imageUploadComponent
