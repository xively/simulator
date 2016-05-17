require('./editor.component.less')

const editorComponent = {
  template: `
    <div ui-ace="editor.aceOptions" ng-model="editor.json"></div>
  `,
  controllerAs: 'editor',
  bindings: {
    json: '=',
    error: '='
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
      onChange: () => {
        this.error = false

        if (!this.json.length) {
          return
        }

        try {
          JSON.parse(this.json)
        } catch (ex) {
          this.error = true
        }
      }
    }
  }
}

module.exports = editorComponent
