'use strict';

var Promise = require('bluebird');

var ngModule = angular.mock.module;

describe('LoginProvider', function() {

  var goodCredentials = {
    accountId: '',
    emailAddress: 'e@mail.com',
    password: 'password',
  };
  var badCredentials = {
    accountId: '',
    emailAddress: '',
    password: '',
  };

  var LoginProvider;
  beforeEach(ngModule('manage-common', function(_LoginProvider_) {
    LoginProvider = _LoginProvider_;
    LoginProvider.options({
      host: process.env.XIVELY_IDM_HOST,
    });
  }));

  beforeEach(inject(function($httpBackend) {
    $httpBackend.whenPOST('https://' + process.env.XIVELY_IDM_HOST + '/api/auth/login')
    .respond(function(method, url, data, headers, params) {
      if (data.emailAddress === 'e@mail.com' && data.password === 'password') {
        return {
          jwt: 'jwt',
        };
      }
      return 400;
    });
    $httpBackend.whenPOST('https://' + process.env.XIVELY_IDM_HOST + '/api/sessions/renew-session')
    .respond(function(method, url, data, headers, params) {
      if (data.jwt === 'jwt') {
        return {
          jwt: 'jwt',
        };
      }
      return 400;
    });
  }));

  it('has options static method', inject(function() {
    expect(LoginProvider).to.have.property('options').and.be.a('function');
  }));

  it('login succeeds with good credentials', inject(function(Login, $httpBackend) {
    return Login.login(goodCredentials);
  }));

  it('login fails with bad credentials', inject(function(Login, $httpBackend) {
    return Login.login(badCredentials)
    .then(function() {
      throw new Error('should have failed');
    })
    .catch(function(error) {
      expect(error.message).to.not.equal('should have failed');
    });
  }));

  it('renew succeeds with an up to date token', inject(function(Login) {

    /* global localStorage:false */
    localStorage.loginToken = 'jwt';
    return Login.renew();
  }));

  it('renew resolves but token will not with an out of date token', inject(function(Login) {
    this.slow(400);

    /* global localStorage:false */
    localStorage.loginToken = 'noop';
    // Renew resolves in error causes.
    return Login.renew()
    .then(function() {
      // token() should never resolve since renew failed.
      return Promise.resolve(Login.token())
      .timeout(100)
      .then(function() {
        throw new Error('Should have timed out.');
      })
      // We expect a TimeoutError, resolve it peacefully. The first argument is bluebird syntax.
      .catch(Promise.TimeoutError, function() {});
    });
  }));

  it('try works if fn passes first time', inject(function(Login) {
    return Login.try(function(token) {
      return;
    });
  }));

  it('try calls renew if fn fails first time', inject(function(Login) {
    var willFail = true;
    Login.try(function() {
      if (willFail) {
        willFail = false;
        throw new Error();
      }
    });
    return new Promise(function(resolve) {
      Login.renew = resolve;
    });
  }));

  it('try works if fn passes second time', inject(function(Login) {

    /* global localStorage:false */
    localStorage.loginToken = 'jwt';
    var willFail = true;
    return Login.try(function() {
      if (willFail) {
        willFail = false;
        throw new Error();
      }
    });
  }));

  it('try fails if fn fails twice', inject(function(Login) {

    /* global localStorage:false */
    localStorage.loginToken = 'jwt';
    var error = new Error();
    return Login.try(function() {
      throw error;
    })
    .catch(function(tryError) {
      expect(tryError).to.equal(error);
    });
  }));

  it('try rejects with first error if fn fails twice', inject(function(Login) {

    /* global localStorage:false */
    localStorage.loginToken = 'jwt';
    var firstError;
    return Login.try(function() {
      if (!firstError) {
        firstError = new Error();
        throw firstError;
      }
      throw new Error();
    })
    .catch(function(tryError) {
      expect(tryError).to.equal(firstError);
    });
  }));

  it('token resolves after login succeeds', inject(function(Login) {
    Login.login(goodCredentials);
    return Login.token();
  }));

  it('token never resolves after login fails', inject(function(Login) {
    this.slow(400);
    Login.login(badCredentials);
    return Promise.resolve(Login.token())
    .timeout(100, 'timeout')
    .then(function() {
      throw new Error('Should have timed out.');
    })
    .catch(function(error) {
      expect(error.message).to.equal('timeout');
    });
  }));

});
