const _ = require('lodash')

require('./editor.component.less')

const editorComponent = {
  template: `
    <div ui-ace="editor.aceOptions" ng-model="editor.json"></div>
  `,
  controllerAs: 'editor',
  bindings: {
    json: '=',
    error: '=',
    update: '&'
  },
  /* @ngInject */
  controller ($scope) {
    this.error = false

    this.aceOptions = {
      useWrapMode: true,
      showGutter: true,
      mode: 'json',
      onLoad: (editor) => {
        editor.setOptions({
          minLines: 10,
          maxLines: Infinity,
          autoScrollEditorIntoView: true
        })
        editor.$blockScrolling = Infinity
      },
      onChange: _.debounce(() => {
        this.error = false

        if (!this.json.length) {
          return
        }

        try {
          const config = JSON.parse(this.json)
          this.update({ config })
        } catch (ex) {
          this.error = true
        }
      }, 500)
    }
  }
}

module.exports = editorComponent
