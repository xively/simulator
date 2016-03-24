'use strict';

var ngModule = angular.mock.module;

describe('BlueprintClientProvider', function() {

  var BlueprintClientProvider;
  beforeEach(ngModule('manage-common', function(_BlueprintClientProvider_) {
    BlueprintClientProvider = _BlueprintClientProvider_;
    BlueprintClientProvider.options({
      host: process.env.XIVELY_BLUEPRINT_HOST,
      accountId: 'accountId',
    });
  }));

  it('has an options static method', inject(function() {
    expect(BlueprintClientProvider).to.have.property('options').and.to.be.a('function');
  }));

  it('resolves to an object with a client property and call method', inject(function(BlueprintClient) {
    expect(BlueprintClient).to.have.a.property('then').and.to.be.a('function');
    return BlueprintClient
    .then(function(wrapper) {
      expect(wrapper).to.have.a.property('client');
      expect(wrapper).to.have.a.property('call').and.to.be.a('function');
    });
  }));

  it('calls api endpoint with accountId specified by options()', inject(function(BlueprintClient) {
    return BlueprintClient
    .then(function(wrapper) {
      wrapper.apis.devices.all = function(args) {
        return args.accountId;
      };
      return wrapper;
    })
    .then(function(wrapper) { return wrapper.call('devices.all'); })
    .then(function(accountId) {
      expect(accountId).to.equal('accountId');
    });
  }));

});
