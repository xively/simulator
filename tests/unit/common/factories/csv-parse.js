'use strict';

var ngModule = angular.mock.module;

describe('csvParse', function() {
  beforeEach(function() {
    ngModule('common');
  });

  var csvParse;
  beforeEach(inject(function(_csvParse_) {
    csvParse = _csvParse_;
  }));

  it('should be an Object with a `serialize` method', function() {
    expect(csvParse).to.be.an('object');
    expect(csvParse).to.have.all.keys(['serialize']);
  });

  describe('serialize', function() {
    it('should handle an empty Array', function() {
      expect(csvParse.serialize([])).to.equal('');
    });

    it('should handle an Array with two null fields', function() {
      expect(csvParse.serialize([
        [null, 'one', 1, null],
      ])).to.equal(',one,1,');
    });

    it('should handle multiple child arrays', function() {
      var arr = [
        [null, 'one', 1, 'low'],
        [null, 'two', 'pls', null],
      ];
      expect(csvParse.serialize(arr)).to.equal(',one,1,low\n,two,pls,');
    });
  });
});
