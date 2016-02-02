'use strict';

var moment = require('moment');

var ngModule = angular.mock.module;

describe('AqiDataProvider', function() {

  var AqiDataProvider;

  beforeEach(ngModule('manage-common', function(_AqiDataProvider_, $provide) {
    AqiDataProvider = _AqiDataProvider_;
    $provide.value('aqiCategories', {
      level: {
        good: {
          color: '#008000',
          label: 'Good',
          threshold: 50,
          level: 1,
        },
        moderate: {
          color: '#ffff00',
          label: 'Moderate',
          threshold: 100,
          level: 2,
        },
      },
      labelMap: {
        1: 'good',
        2: 'moderate',
      },
    });
  }));

  beforeEach(inject(function($httpBackend) {
    $httpBackend.whenGET('http://www.airnowapi.org/aq/data/')
    .respond(function(method, url, data, headers, params) {
      return [200, [
        {
          Latitude: 0,
          Longitude: 0,
          UTC: moment().format('YYYY-MM-DD[T]HH'),
          AQI: 0,
        },
        {
          Latitude: 0,
          Longitude: 0,
          UTC: moment().format('YYYY-MM-DD[T]HH'),
          AQI: 1,
        },
      ]];
    });
  }));

  it('has options static method', inject(function() {
    expect(AqiDataProvider).to.have.property('options').and.be.a('function');
  }));

  it('has categoryByValue method', inject(function(AqiData) {
    expect(AqiData).to.have.property('categoryByValue').and.be.a('function');
  }));

  it('has getLatestValue method', inject(function(AqiData) {
    expect(AqiData).to.have.property('getLatestValue').and.be.a('function');
  }));

  it('has getHistory method', inject(function(AqiData) {
    expect(AqiData).to.have.property('getHistory').and.be.a('function');
  }));

  it('categorizes values with categoryByValue', inject(function(AqiData) {
    expect(AqiData.categoryByValue(25)).to.have.property('label').and.to.equal('Good');
    expect(AqiData.categoryByValue(75)).to.have.property('label').and.to.equal('Moderate');
  }));

  it('get the latest with getLatestValue', inject(function(AqiData) {
    return AqiData.getLatestValue()
    .then(function(latest) {
      expect(latest).to.have.property('value').and.to.equal(1);
      expect(latest).to.have.property('category').to.have.property('label').and.to.equal('Good');
    });
  }));

  it('get the recent history with getHistory', inject(function(AqiData) {
    return AqiData.getHistory()
    .then(function(data) {
      expect(data).to.have.length.of(2);
      expect(data[0]).to.have.all.keys('time', 'value');
    });
  }));

});
