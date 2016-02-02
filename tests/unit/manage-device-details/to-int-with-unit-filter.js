'use strict';

var ngModule = angular.mock.module;

describe('toIntWithUnit', function() {

  beforeEach(ngModule('concaria-manage-device-details'));

  it('casts certain falsy values to NaN', inject(function($sce, toIntWithUnitFilter) {
    expect($sce.getTrusted($sce.HTML, toIntWithUnitFilter())).to.equal('N/A');
    expect($sce.getTrusted($sce.HTML, toIntWithUnitFilter(null))).to.equal('N/A');
    expect($sce.getTrusted($sce.HTML, toIntWithUnitFilter(''))).to.equal('N/A');
  }));

  it('casts other values to a number', inject(function($sce, toIntWithUnitFilter) {
    expect($sce.getTrusted($sce.HTML, toIntWithUnitFilter('100'))).to.equal('100');
    expect($sce.getTrusted($sce.HTML, toIntWithUnitFilter(100))).to.equal('100');
    expect($sce.getTrusted($sce.HTML, toIntWithUnitFilter(0))).to.equal('0');
  }));

  it('appends passed unit', inject(function($sce, toIntWithUnitFilter) {
    expect($sce.getTrusted($sce.HTML, toIntWithUnitFilter('10', '%'))).to.equal('10%');
    expect($sce.getTrusted($sce.HTML, toIntWithUnitFilter('', '%'))).to.equal('N/A');
  }));

});
