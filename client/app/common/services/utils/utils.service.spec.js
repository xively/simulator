const expect = require('chai').expect
const commonModule = require('./')

describe('Utils', () => {
  beforeEach(angular.mock.module(commonModule))

  let utils
  beforeEach(inject(($injector) => {
    utils = $injector.get('utils')
  }))

  describe('#numberOrString', () => {
    it('should parse a string if it is a number', () => {
      const number = utils.numberOrString('1')
      expect(number).to.eql(1)
    })

    it('should return the string if it can not be parsed', () => {
      const string = utils.numberOrString('a')
      expect(string).to.eql('a')
    })
  })
})
