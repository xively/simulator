require('./image-upload.component.less')

/* @ngInject */
const imageUploadComponent = {
  template: `
    <div class="image-upload" ng-click="imageUpload.showModal()">
      <div class="upload-field">
        <img class="thumbnail" ng-show="imageUpload.image" ng-src="{{imageUpload.image}}" />
      </div>
      <small>Click to update image</small>
    </div>
    <modal name="imageUpload" width="580px" height="300px">
      <tabs>
        <tab name="From my computer">
          <div class="drop-box"
               ng-model="imageUpload.newFile"
               ngf-select ngf-drop
               ngf-drag-over-class="{pattern: 'image/*', accept:'accept', reject:'reject', delay:100}"
               ngf-accept="'image/*'" accept="image/*">
               <span>Click to select or Drop Image</span>
               <img ng-show="imageUpload.newFile" ngf-src="imageUpload.newFile"/>
          </div>
          <div class="buttons">
            <button class="button" ng-disabled="!imageUpload.newFile" ng-click="imageUpload.uploadImage()">Upload</button>
            <button class="button" ng-click="imageUpload.closeModal()">Cancel</button>
          </div>
        </tab>
        <tab name="From the web">
          <input type="text" class="input-field" placeholder="{{ imageUpload.image }}" ng-model="imageUpload.newImage"/>
          <div class="buttons">
            <button class="button" ng-disabled="!imageUpload.newImage" ng-click="imageUpload.applyImage()">OK</button>
            <button class="button" ng-click="imageUpload.closeModal()">Cancel</button>
          </div>
        </tab>
      </tabs>
    </modal>
  `,
  controllerAs: 'imageUpload',
  bindings: {
    image: '='
  },
  /* @ngInject */
  controller (settingsService, modalService, Upload) {
    this.showModal = () => {
      modalService.open('imageUpload')
    }

    this.closeModal = () => {
      modalService.close('imageUpload')
    }

    this.uploadImage = () => {
      Upload.upload({
        url: '/api/images',
        data: {
          file: this.newFile
        }
      })
      .then((response) => {
        this.image = response.data.imageUrl
        this.closeModal()
      })
    }

    this.applyImage = () => {
      this.image = this.newImage
      this.closeModal()
    }
  }
}

module.exports = imageUploadComponent
