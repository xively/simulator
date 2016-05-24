const angular = require('angular')
const _ = require('lodash')

function modalService () {
  return {
    modals: {},
    register (modal) {
      // decorate modal
      modal.opened = false
      modal.open = () => {
        modal.opened = true
        const body = angular.element(document).find('body')
        body.addClass('scroll-lock')
      }
      modal.close = () => {
        modal.opened = false
        const childModals = angular.element(modal.element)
          .find('modal')
          .controller('modal')
        if (childModals) {
          childModals.close()
        }

        if (!_.some(this.modals, 'opened')) {
          const body = angular.element(document).find('body')
          body.removeClass('scroll-lock')
        }
      }
      // add to modals
      this.modals[modal.name] = modal
    },
    open (name) {
      const modal = this.modals[name]
      if (modal) {
        modal.open()
      }
    },
    close (name) {
      const modal = this.modals[name]
      if (modal) {
        modal.close()
      }
    },
    closeAll () {
      _.forEach(this.modals, (modal) => modal.close())
    }
  }
}

module.exports = modalService
