(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("lodash"), require("bluebird"));
	else if(typeof define === 'function' && define.amd)
		define(["lodash", "bluebird"], factory);
	else if(typeof exports === 'object')
		exports["BlueprintClient"] = factory(require("lodash"), require("bluebird"));
	else
		root["BlueprintClient"] = factory(root["lodash"], root["bluebird"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1);
	var bluebird = __webpack_require__(2);
	var SwaggerClient = __webpack_require__(3);
	
	var ResourceNameMap = __webpack_require__(9).ResourceNameMap;
	
	/**
	 * BlueprintClient
	 * Client to make restful requests with the blueprint backend.
	 *
	 * @param options {Object} options object
	 *   - authorization {string} value needed to authorize for every request
	 *   - accountId {string} account id used in most requests
	 */
	function BlueprintClient(options) {
	  var _this = this;
	  this.accountId = options.accountId;
	  var readyPromise = this.ready = new bluebird(function(resolve, reject) {
	    SwaggerClient.SwaggerApi.call(_this, {
	
	      url: options.docsUrl || 'https://blueprint.xively.com/api/v1/docs',
	      authorizations: options.authorization ?
	        new SwaggerClient.ApiKeyAuthorization('authorization', options.authorization, 'header') :
	        SwaggerClient.authorizations,
	
	      useJQuery: options.useJQuery !== undefined ? options.useJQuery : typeof window !== 'undefined',
	
	      success: function() {
	        var all = _.every(_this.apisArray, 'ready');
	
	        if (all) {
	          new ResourceNameMap().remap(_this, _this.apisArray);
	
	          resolve(_this);
	        }
	
	        // We're overwriting the normal SwaggerApi ready member (a boolean) with a promise.
	        _this.ready = readyPromise;
	      },
	
	      failure: reject,
	
	    });
	  });
	}
	
	BlueprintClient.prototype = Object.create(SwaggerClient.SwaggerApi.prototype);
	
	/**
	 * setAuthorization
	 * Store an authorization token or replace the current one.
	 *
	 * @param authorization {String} authorization token
	 */
	BlueprintClient.prototype.setAuthorization = function(authorization) {
	  this.clientAuthorizations =
	  new SwaggerClient.ApiKeyAuthorization('authorization', authorization, 'header');
	};
	
	/**
	 * setAccountId
	 * Store an accountId to use by default or replace the current one.
	 *
	 * @param accountId {String} account identifier
	 */
	BlueprintClient.prototype.setAccountId = function(accountId) {
	  this.accountId = accountId;
	};
	
	module.exports = BlueprintClient;


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	// swagger.js
	// version 2.0.48
	
	(function () {
	  var __bind = function (fn, me) {
	    return function () {
	      return fn.apply(me, arguments);
	    };
	  };
	
	  var log = function () {
	    log.history = log.history || [];
	    log.history.push(arguments);
	    if (this.console) {
	      console.log(Array.prototype.slice.call(arguments)[0]);
	    }
	  };
	
	  /**
	   * allows override of the default value based on the parameter being
	   * supplied
	   **/
	  var applyParameterMacro = function (model, parameter) {
	    var e = (typeof window !== 'undefined' ? window : exports);
	    if(e.parameterMacro)
	      return e.parameterMacro(model, parameter);
	    else
	      return parameter.defaultValue;
	  }
	
	  /**
	   * allows overriding the default value of an operation
	   **/
	  var applyModelPropertyMacro = function (operation, property) {
	    var e = (typeof window !== 'undefined' ? window : exports);
	    if(e.modelPropertyMacro)
	      return e.modelPropertyMacro(operation, property);
	    else
	      return property.defaultValue;
	  }
	
	  if (!Array.prototype.indexOf) {
	    Array.prototype.indexOf = function (obj, start) {
	      for (var i = (start || 0), j = this.length; i < j; i++) {
	        if (this[i] === obj) { return i; }
	      }
	      return -1;
	    }
	  }
	
	  if (!('filter' in Array.prototype)) {
	    Array.prototype.filter = function (filter, that /*opt*/) {
	      var other = [], v;
	      for (var i = 0, n = this.length; i < n; i++)
	        if (i in this && filter.call(that, v = this[i], i, this))
	          other.push(v);
	      return other;
	    };
	  }
	
	  if (!('map' in Array.prototype)) {
	    Array.prototype.map = function (mapper, that /*opt*/) {
	      var other = new Array(this.length);
	      for (var i = 0, n = this.length; i < n; i++)
	        if (i in this)
	          other[i] = mapper.call(that, this[i], i, this);
	      return other;
	    };
	  }
	
	  Object.keys = Object.keys || (function () {
	    var hasOwnProperty = Object.prototype.hasOwnProperty,
	      hasDontEnumBug = !{ toString: null }.propertyIsEnumerable('toString'),
	      DontEnums = [
	        'toString',
	        'toLocaleString',
	        'valueOf',
	        'hasOwnProperty',
	        'isPrototypeOf',
	        'propertyIsEnumerable',
	        'constructor'
	      ],
	      DontEnumsLength = DontEnums.length;
	
	    return function (o) {
	      if (typeof o != 'object' && typeof o != 'function' || o === null)
	        throw new TypeError('Object.keys called on a non-object');
	
	      var result = [];
	      for (var name in o) {
	        if (hasOwnProperty.call(o, name))
	          result.push(name);
	      }
	
	      if (hasDontEnumBug) {
	        for (var i = 0; i < DontEnumsLength; i++) {
	          if (hasOwnProperty.call(o, DontEnums[i]))
	            result.push(DontEnums[i]);
	        }
	      }
	
	      return result;
	    };
	  })();
	
	  var SwaggerApi = function (url, options) {
	    this.isBuilt = false;
	    this.url = null;
	    this.debug = false;
	    this.basePath = null;
	    this.authorizations = null;
	    this.authorizationScheme = null;
	    this.info = null;
	    this.useJQuery = false;
	    this.modelsArray = [];
	    this.isValid;
	
	    options = (options || {});
	    if (url)
	      if (url.url)
	        options = url;
	      else
	        this.url = url;
	    else
	      options = url;
	
	    if (options.url != null)
	      this.url = options.url;
	
	    this.swaggerRequstHeaders = options.swaggerRequstHeaders || 'application/json,application/json;charset=utf-8,*/*';
	    this.defaultSuccessCallback = options.defaultSuccessCallback || null;
	    this.defaultErrorCallback = options.defaultErrorCallback || null;
	    this.supportedSubmitMethods = options.supportedSubmitMethods || [];
	
	    if (options.success != null)
	      this.success = options.success;
	
	    if (typeof options.useJQuery === 'boolean')
	      this.useJQuery = options.useJQuery;
	
	    if (options.authorizations) {
	      this.clientAuthorizations = options.authorizations;
	    } else {
	      var e = (typeof window !== 'undefined' ? window : exports);
	      this.clientAuthorizations = e.authorizations;
	    }
	
	    this.failure = options.failure != null ? options.failure : function () { };
	    this.progress = options.progress != null ? options.progress : function () { };
	    if (options.success != null) {
	      this.build();
	      this.isBuilt = true;
	    }
	  };
	
	  SwaggerApi.prototype.build = function (mock) {
	    if (this.isBuilt)
	      return this;
	    var _this = this;
	    this.progress('fetching resource list: ' + this.url);
	    var obj = {
	      useJQuery: this.useJQuery,
	      url: this.url,
	      method: 'GET',
	      headers: {
	        accept: _this.swaggerRequstHeaders
	      },
	      on: {
	        error: function (response) {
	          if (_this.url.substring(0, 4) !== 'http') {
	            return _this.fail('Please specify the protocol for ' + _this.url);
	          } else if (response.status === 0) {
	            return _this.fail('Can\'t read from server.  It may not have the appropriate access-control-origin settings.');
	          } else if (response.status === 404) {
	            return _this.fail('Can\'t read swagger JSON from ' + _this.url);
	          } else {
	            return _this.fail(response.status + ' : ' + response.statusText + ' ' + _this.url);
	          }
	        },
	        response: function (resp) {
	          var responseObj = resp.obj || JSON.parse(resp.data);
	          _this.swaggerVersion = responseObj.swaggerVersion;
	          if (_this.swaggerVersion === '1.2') {
	            return _this.buildFromSpec(responseObj);
	          } else {
	            return _this.buildFrom1_1Spec(responseObj);
	          }
	        }
	      }
	    };
	    var e = (typeof window !== 'undefined' ? window : exports);
	    e.authorizations.apply(obj);
	    if (mock === true)
	      return obj;
	
	    new SwaggerHttp().execute(obj);
	    return this;
	  };
	
	  SwaggerApi.prototype.buildFromSpec = function (response) {
	    if (response.apiVersion != null) {
	      this.apiVersion = response.apiVersion;
	    }
	    this.apis = {};
	    this.apisArray = [];
	    this.consumes = response.consumes;
	    this.produces = response.produces;
	    this.authSchemes = response.authorizations;
	    if (response.info != null) {
	      this.info = response.info;
	    }
	    var isApi = false;
	    var i;
	    for (i = 0; i < response.apis.length; i++) {
	      var api = response.apis[i];
	      if (api.operations) {
	        var j;
	        for (j = 0; j < api.operations.length; j++) {
	          operation = api.operations[j];
	          isApi = true;
	        }
	      }
	    }
	    if (response.basePath)
	      this.basePath = response.basePath;
	    else if (this.url.indexOf('?') > 0)
	      this.basePath = this.url.substring(0, this.url.lastIndexOf('?'));
	    else
	      this.basePath = this.url;
	
	    if (isApi) {
	      var newName = response.resourcePath.replace(/\//g, '');
	      this.resourcePath = response.resourcePath;
	      var res = new SwaggerResource(response, this);
	      this.apis[newName] = res;
	      this.apisArray.push(res);
	    } else {
	      var k;
	      for (k = 0; k < response.apis.length; k++) {
	        var resource = response.apis[k];
	        var res = new SwaggerResource(resource, this);
	        this.apis[res.name] = res;
	        this.apisArray.push(res);
	      }
	    }
	    this.isValid = true;
	    if (this.success) {
	      this.success();
	    }
	    return this;
	  };
	
	  SwaggerApi.prototype.buildFrom1_1Spec = function (response) {
	    log('This API is using a deprecated version of Swagger!  Please see http://github.com/wordnik/swagger-core/wiki for more info');
	    if (response.apiVersion != null)
	      this.apiVersion = response.apiVersion;
	    this.apis = {};
	    this.apisArray = [];
	    this.produces = response.produces;
	    if (response.info != null) {
	      this.info = response.info;
	    }
	    var isApi = false;
	    for (var i = 0; i < response.apis.length; i++) {
	      var api = response.apis[i];
	      if (api.operations) {
	        for (var j = 0; j < api.operations.length; j++) {
	          operation = api.operations[j];
	          isApi = true;
	        }
	      }
	    }
	    if (response.basePath) {
	      this.basePath = response.basePath;
	    } else if (this.url.indexOf('?') > 0) {
	      this.basePath = this.url.substring(0, this.url.lastIndexOf('?'));
	    } else {
	      this.basePath = this.url;
	    }
	    if (isApi) {
	      var newName = response.resourcePath.replace(/\//g, '');
	      this.resourcePath = response.resourcePath;
	      var res = new SwaggerResource(response, this);
	      this.apis[newName] = res;
	      this.apisArray.push(res);
	    } else {
	      for (k = 0; k < response.apis.length; k++) {
	        resource = response.apis[k];
	        var res = new SwaggerResource(resource, this);
	        this.apis[res.name] = res;
	        this.apisArray.push(res);
	      }
	    }
	    this.isValid = true;
	    if (this.success) {
	      this.success();
	    }
	    return this;
	  };
	
	  SwaggerApi.prototype.selfReflect = function () {
	    var resource, resource_name, ref;
	    if (this.apis == null) {
	      return false;
	    }
	    ref = this.apis;
	    for (resource_name in ref) {
	      resource = ref[resource_name];
	      if (resource.ready == null) {
	        return false;
	      }
	    }
	    this.setConsolidatedModels();
	    this.ready = true;
	    if (this.success != null) {
	      return this.success();
	    }
	  };
	
	  SwaggerApi.prototype.fail = function (message) {
	    this.failure(message);
	    throw message;
	  };
	
	  SwaggerApi.prototype.setConsolidatedModels = function () {
	    var model, modelName, resource, resource_name, _i, _len, _ref, _ref1, _results;
	    this.models = {};
	    _ref = this.apis;
	    for (resource_name in _ref) {
	      resource = _ref[resource_name];
	      for (modelName in resource.models) {
	        if (this.models[modelName] == null) {
	          this.models[modelName] = resource.models[modelName];
	          this.modelsArray.push(resource.models[modelName]);
	        }
	      }
	    }
	    _ref1 = this.modelsArray;
	    _results = [];
	    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
	      model = _ref1[_i];
	      _results.push(model.setReferencedModels(this.models));
	    }
	    return _results;
	  };
	
	  SwaggerApi.prototype.help = function () {
	    var operation, operation_name, parameter, resource, resource_name, _i, _len, _ref, _ref1, _ref2;
	    _ref = this.apis;
	    for (resource_name in _ref) {
	      resource = _ref[resource_name];
	      log(resource_name);
	      _ref1 = resource.operations;
	      for (operation_name in _ref1) {
	        operation = _ref1[operation_name];
	        log('  ' + operation.nickname);
	        _ref2 = operation.parameters;
	        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
	          parameter = _ref2[_i];
	          log('  ' + parameter.name + (parameter.required ? ' (required)' : '') + ' - ' + parameter.description);
	        }
	      }
	    }
	    return this;
	  };
	
	  var SwaggerResource = function (resourceObj, api) {
	    var _this = this;
	    this.api = api;
	    this.swaggerRequstHeaders = api.swaggerRequstHeaders;
	    this.path = this.api.resourcePath != null ? this.api.resourcePath : resourceObj.path;
	    this.description = resourceObj.description;
	    this.authorizations = (resourceObj.authorizations || {});
	
	    var parts = this.path.split('/');
	    this.name = parts[parts.length - 1].replace('.{format}', '');
	    this.basePath = this.api.basePath;
	    this.operations = {};
	    this.operationsArray = [];
	    this.modelsArray = [];
	    this.models = {};
	    this.rawModels = {};
	    this.useJQuery = (typeof api.useJQuery !== 'undefined' ? api.useJQuery : null);
	
	    if ((resourceObj.apis != null) && (this.api.resourcePath != null)) {
	      this.addApiDeclaration(resourceObj);
	    } else {
	      if (this.path == null) {
	        this.api.fail('SwaggerResources must have a path.');
	      }
	      if (this.path.substring(0, 4) === 'http') {
	        this.url = this.path.replace('{format}', 'json');
	      } else {
	        this.url = this.api.basePath + this.path.replace('{format}', 'json');
	      }
	      this.api.progress('fetching resource ' + this.name + ': ' + this.url);
	      var obj = {
	        url: this.url,
	        method: 'GET',
	        useJQuery: this.useJQuery,
	        headers: {
	          accept: this.swaggerRequstHeaders
	        },
	        on: {
	          response: function (resp) {
	            var responseObj = resp.obj || JSON.parse(resp.data);
	            return _this.addApiDeclaration(responseObj);
	          },
	          error: function (response) {
	            return _this.api.fail('Unable to read api \'' +
	            _this.name + '\' from path ' + _this.url + ' (server returned ' + response.statusText + ')');
	          }
	        }
	      };
	      var e = typeof window !== 'undefined' ? window : exports;
	      e.authorizations.apply(obj);
	      new SwaggerHttp().execute(obj);
	    }
	  }
	
	  SwaggerResource.prototype.getAbsoluteBasePath = function (relativeBasePath) {
	    var pos, url;
	    url = this.api.basePath;
	    pos = url.lastIndexOf(relativeBasePath);
	    var parts = url.split('/');
	    var rootUrl = parts[0] + '//' + parts[2];
	
	    if (relativeBasePath.indexOf('http') === 0)
	      return relativeBasePath;
	    if (relativeBasePath === '/')
	      return rootUrl;
	    if (relativeBasePath.substring(0, 1) == '/') {
	      // use root + relative
	      return rootUrl + relativeBasePath;
	    }
	    else {
	      var pos = this.basePath.lastIndexOf('/');
	      var base = this.basePath.substring(0, pos);
	      if (base.substring(base.length - 1) == '/')
	        return base + relativeBasePath;
	      else
	        return base + '/' + relativeBasePath;
	    }
	  };
	
	  SwaggerResource.prototype.addApiDeclaration = function (response) {
	    if (response.produces != null)
	      this.produces = response.produces;
	    if (response.consumes != null)
	      this.consumes = response.consumes;
	    if ((response.basePath != null) && response.basePath.replace(/\s/g, '').length > 0)
	      this.basePath = response.basePath.indexOf('http') === -1 ? this.getAbsoluteBasePath(response.basePath) : response.basePath;
	
	    this.addModels(response.models);
	    if (response.apis) {
	      for (var i = 0 ; i < response.apis.length; i++) {
	        var endpoint = response.apis[i];
	        this.addOperations(endpoint.path, endpoint.operations, response.consumes, response.produces);
	      }
	    }
	    this.api[this.name] = this;
	    this.ready = true;
	    return this.api.selfReflect();
	  };
	
	  SwaggerResource.prototype.addModels = function (models) {
	    if (models != null) {
	      var modelName;
	      for (modelName in models) {
	        if (this.models[modelName] == null) {
	          var swaggerModel = new SwaggerModel(modelName, models[modelName]);
	          this.modelsArray.push(swaggerModel);
	          this.models[modelName] = swaggerModel;
	          this.rawModels[modelName] = models[modelName];
	        }
	      }
	      var output = [];
	      for (var i = 0; i < this.modelsArray.length; i++) {
	        var model = this.modelsArray[i];
	        output.push(model.setReferencedModels(this.models));
	      }
	      return output;
	    }
	  };
	
	  SwaggerResource.prototype.addOperations = function (resource_path, ops, consumes, produces) {
	    if (ops) {
	      var output = [];
	      for (var i = 0; i < ops.length; i++) {
	        var o = ops[i];
	        consumes = this.consumes;
	        produces = this.produces;
	        if (o.consumes != null)
	          consumes = o.consumes;
	        else
	          consumes = this.consumes;
	
	        if (o.produces != null)
	          produces = o.produces;
	        else
	          produces = this.produces;
	        var type = (o.type || o.responseClass);
	
	        if (type === 'array') {
	          ref = null;
	          if (o.items)
	            ref = o.items['type'] || o.items['$ref'];
	          type = 'array[' + ref + ']';
	        }
	        var responseMessages = o.responseMessages;
	        var method = o.method;
	        if (o.httpMethod) {
	          method = o.httpMethod;
	        }
	        if (o.supportedContentTypes) {
	          consumes = o.supportedContentTypes;
	        }
	        if (o.errorResponses) {
	          responseMessages = o.errorResponses;
	          for (var j = 0; j < responseMessages.length; j++) {
	            r = responseMessages[j];
	            r.message = r.reason;
	            r.reason = null;
	          }
	        }
	        o.nickname = this.sanitize(o.nickname);
	        var op = new SwaggerOperation(o.nickname, resource_path, method, o.parameters, o.summary, o.notes, type, responseMessages, this, consumes, produces, o.authorizations, o.deprecated);
	        this.operations[op.nickname] = op;
	        output.push(this.operationsArray.push(op));
	      }
	      return output;
	    }
	  };
	
	  SwaggerResource.prototype.sanitize = function (nickname) {
	    var op;
	    op = nickname.replace(/[\s!@#$%^&*()_+=\[{\]};:<>|.\/?,\\'""-]/g, '_');
	    op = op.replace(/((_){2,})/g, '_');
	    op = op.replace(/^(_)*/g, '');
	    op = op.replace(/([_])*$/g, '');
	    return op;
	  };
	
	  var SwaggerModel = function (modelName, obj) {
	    this.name = obj.id != null ? obj.id : modelName;
	    this.properties = [];
	    var propertyName;
	    for (propertyName in obj.properties) {
	      if (obj.required != null) {
	        var value;
	        for (value in obj.required) {
	          if (propertyName === obj.required[value]) {
	            obj.properties[propertyName].required = true;
	          }
	        }
	      }
	      var prop = new SwaggerModelProperty(propertyName, obj.properties[propertyName], this);
	      this.properties.push(prop);
	    }
	  }
	
	  SwaggerModel.prototype.setReferencedModels = function (allModels) {
	    var results = [];
	    for (var i = 0; i < this.properties.length; i++) {
	      var property = this.properties[i];
	      var type = property.type || property.dataType;
	      if (allModels[type] != null)
	        results.push(property.refModel = allModels[type]);
	      else if ((property.refDataType != null) && (allModels[property.refDataType] != null))
	        results.push(property.refModel = allModels[property.refDataType]);
	      else
	        results.push(void 0);
	    }
	    return results;
	  };
	
	  SwaggerModel.prototype.getMockSignature = function (modelsToIgnore) {
	    var propertiesStr = [];
	    for (var i = 0; i < this.properties.length; i++) {
	      var prop = this.properties[i];
	      propertiesStr.push(prop.toString());
	    }
	
	    var strong = '<span class="strong">';
	    var strongClose = '</span>';
	    var classOpen = strong + this.name + ' {' + strongClose;
	    var classClose = strong + '}' + strongClose;
	    var returnVal = classOpen + '<div>' + propertiesStr.join(',</div><div>') + '</div>' + classClose;
	    if (!modelsToIgnore)
	      modelsToIgnore = [];
	    modelsToIgnore.push(this.name);
	
	    for (var i = 0; i < this.properties.length; i++) {
	      var prop = this.properties[i];
	      if ((prop.refModel != null) && modelsToIgnore.indexOf(prop.refModel.name) === -1) {
	        returnVal = returnVal + ('<br>' + prop.refModel.getMockSignature(modelsToIgnore));
	      }
	    }
	    return returnVal;
	  };
	
	  SwaggerModel.prototype.createJSONSample = function (modelsToIgnore) {
	    if (sampleModels[this.name]) {
	      return sampleModels[this.name];
	    }
	    else {
	      var result = {};
	      var modelsToIgnore = (modelsToIgnore || [])
	      modelsToIgnore.push(this.name);
	      for (var i = 0; i < this.properties.length; i++) {
	        var prop = this.properties[i];
	        result[prop.name] = prop.getSampleValue(modelsToIgnore);
	      }
	      modelsToIgnore.pop(this.name);
	      return result;
	    }
	  };
	
	  var SwaggerModelProperty = function (name, obj, model) {
	    this.name = name;
	    this.dataType = obj.type || obj.dataType || obj['$ref'];
	    this.isCollection = this.dataType && (this.dataType.toLowerCase() === 'array' || this.dataType.toLowerCase() === 'list' || this.dataType.toLowerCase() === 'set');
	    this.descr = obj.description;
	    this.required = obj.required;
	    this.defaultValue = applyModelPropertyMacro(obj, model);
	    if (obj.items != null) {
	      if (obj.items.type != null) {
	        this.refDataType = obj.items.type;
	      }
	      if (obj.items.$ref != null) {
	        this.refDataType = obj.items.$ref;
	      }
	    }
	    this.dataTypeWithRef = this.refDataType != null ? (this.dataType + '[' + this.refDataType + ']') : this.dataType;
	    if (obj.allowableValues != null) {
	      this.valueType = obj.allowableValues.valueType;
	      this.values = obj.allowableValues.values;
	      if (this.values != null) {
	        this.valuesString = '\'' + this.values.join('\' or \'') + '\'';
	      }
	    }
	    if (obj['enum'] != null) {
	      this.valueType = 'string';
	      this.values = obj['enum'];
	      if (this.values != null) {
	        this.valueString = '\'' + this.values.join('\' or \'') + '\'';
	      }
	    }
	  }
	
	  SwaggerModelProperty.prototype.getSampleValue = function (modelsToIgnore) {
	    var result;
	    if ((this.refModel != null) && (modelsToIgnore.indexOf(this.refModel.name) === -1)) {
	      result = this.refModel.createJSONSample(modelsToIgnore);
	    } else {
	      if (this.isCollection) {
	        result = this.toSampleValue(this.refDataType);
	      } else {
	        result = this.toSampleValue(this.dataType);
	      }
	    }
	    if (this.isCollection) {
	      return [result];
	    } else {
	      return result;
	    }
	  };
	
	  SwaggerModelProperty.prototype.toSampleValue = function (value) {
	    var result;
	    if ((typeof this.defaultValue !== 'undefined') && this.defaultValue !== null) {
	      result = this.defaultValue;
	    } else if (value === 'integer') {
	      result = 0;
	    } else if (value === 'boolean') {
	      result = false;
	    } else if (value === 'double' || value === 'number') {
	      result = 0.0;
	    } else if (value === 'string') {
	      result = '';
	    } else {
	      result = value;
	    }
	    return result;
	  };
	
	  SwaggerModelProperty.prototype.toString = function () {
	    var req = this.required ? 'propReq' : 'propOpt';
	    var str = '<span class="propName ' + req + '">' + this.name + '</span> (<span class="propType">' + this.dataTypeWithRef + '</span>';
	    if (!this.required) {
	      str += ', <span class="propOptKey">optional</span>';
	    }
	    str += ')';
	    if (this.values != null) {
	      str += ' = <span class="propVals">["' + this.values.join('\' or \'') + '\']</span>';
	    }
	    if (this.descr != null) {
	      str += ': <span class="propDesc">' + this.descr + '</span>';
	    }
	    return str;
	  };
	
	  var SwaggerOperation = function (nickname, path, method, parameters, summary, notes, type, responseMessages, resource, consumes, produces, authorizations, deprecated) {
	    var _this = this;
	
	    var errors = [];
	    this.nickname = (nickname || errors.push('SwaggerOperations must have a nickname.'));
	    this.path = (path || errors.push('SwaggerOperation ' + nickname + ' is missing path.'));
	    this.method = (method || errors.push('SwaggerOperation ' + nickname + ' is missing method.'));
	    this.parameters = parameters != null ? parameters : [];
	    this.summary = summary;
	    this.notes = notes;
	    this.type = type;
	    this.responseMessages = (responseMessages || []);
	    this.resource = (resource || errors.push('Resource is required'));
	    this.consumes = consumes;
	    this.produces = produces;
	    this.authorizations = typeof authorizations !== 'undefined' ? authorizations : resource.authorizations;
	    this.deprecated = deprecated;
	    this['do'] = __bind(this['do'], this);
	
	    if (errors.length > 0) {
	      console.error('SwaggerOperation errors', errors, arguments);
	      this.resource.api.fail(errors);
	    }
	
	    this.path = this.path.replace('{format}', 'json');
	    this.method = this.method.toLowerCase();
	    this.isGetMethod = this.method === 'GET';
	
	    this.resourceName = this.resource.name;
	    if (typeof this.type !== 'undefined' && this.type === 'void')
	      this.type = null;
	    else {
	      this.responseClassSignature = this.getSignature(this.type, this.resource.models);
	      this.responseSampleJSON = this.getSampleJSON(this.type, this.resource.models);
	    }
	
	    for (var i = 0; i < this.parameters.length; i++) {
	      var param = this.parameters[i];
	      // might take this away
	      param.name = param.name || param.type || param.dataType;
	
	      // for 1.1 compatibility
	      var type = param.type || param.dataType;
	      if (type === 'array') {
	        type = 'array[' + (param.items.$ref ? param.items.$ref : param.items.type) + ']';
	      }
	      param.type = type;
	
	      if (type && type.toLowerCase() === 'boolean') {
	        param.allowableValues = {};
	        param.allowableValues.values = ['true', 'false'];
	      }
	      param.signature = this.getSignature(type, this.resource.models);
	      param.sampleJSON = this.getSampleJSON(type, this.resource.models);
	
	      var enumValue = param['enum'];
	      if (enumValue != null) {
	        param.isList = true;
	        param.allowableValues = {};
	        param.allowableValues.descriptiveValues = [];
	
	        for (var j = 0; j < enumValue.length; j++) {
	          var v = enumValue[j];
	          if (param.defaultValue != null) {
	            param.allowableValues.descriptiveValues.push({
	              value: String(v),
	              isDefault: (v === param.defaultValue)
	            });
	          }
	          else {
	            param.allowableValues.descriptiveValues.push({
	              value: String(v),
	              isDefault: false
	            });
	          }
	        }
	      }
	      else if (param.allowableValues != null) {
	        if (param.allowableValues.valueType === 'RANGE')
	          param.isRange = true;
	        else
	          param.isList = true;
	        if (param.allowableValues != null) {
	          param.allowableValues.descriptiveValues = [];
	          if (param.allowableValues.values) {
	            for (var j = 0; j < param.allowableValues.values.length; j++) {
	              var v = param.allowableValues.values[j];
	              if (param.defaultValue != null) {
	                param.allowableValues.descriptiveValues.push({
	                  value: String(v),
	                  isDefault: (v === param.defaultValue)
	                });
	              }
	              else {
	                param.allowableValues.descriptiveValues.push({
	                  value: String(v),
	                  isDefault: false
	                });
	              }
	            }
	          }
	        }
	      }
	      param.defaultValue = applyParameterMacro(param, this);
	    }
	    var defaultSuccessCallback = this.resource.api.defaultSuccessCallback || null;
	    var defaultErrorCallback = this.resource.api.defaultErrorCallback || null;
	
	    this.resource[this.nickname] = function (args, opts, callback, error) {
	      var arg1 = args,
	        arg2 = opts,
	        arg3 = callback || defaultSuccessCallback,
	        arg4 = error || defaultErrorCallback;
	      if(typeof opts === 'function') {
	        arg2 = {};
	        arg3 = opts;
	        arg4 = callback;
	      }
	      return _this['do'](arg1, arg2, arg3, arg4);
	    };
	    this.resource[this.nickname].help = function () {
	      return _this.help();
	    };
	    this.resource[this.nickname].asCurl = function (args) {
	      return _this.asCurl(args);
	    };
	  }
	
	  SwaggerOperation.prototype.isListType = function (type) {
	    if (type && type.indexOf('[') >= 0) {
	      return type.substring(type.indexOf('[') + 1, type.indexOf(']'));
	    } else {
	      return void 0;
	    }
	  };
	
	  SwaggerOperation.prototype.getSignature = function (type, models) {
	    var isPrimitive, listType;
	    listType = this.isListType(type);
	    isPrimitive = ((listType != null) && models[listType]) || (models[type] != null) ? false : true;
	    if (isPrimitive) {
	      return type;
	    } else {
	      if (listType != null) {
	        return models[listType].getMockSignature();
	      } else {
	        return models[type].getMockSignature();
	      }
	    }
	  };
	
	  SwaggerOperation.prototype.getSampleJSON = function (type, models) {
	    var isPrimitive, listType, val;
	    listType = this.isListType(type);
	    isPrimitive = ((listType != null) && models[listType]) || (models[type] != null) ? false : true;
	    val = isPrimitive ? void 0 : (listType != null ? models[listType].createJSONSample() : models[type].createJSONSample());
	    if (val) {
	      val = listType ? [val] : val;
	      if (typeof val == 'string')
	        return val;
	      else if (typeof val === 'object') {
	        var t = val;
	        if (val instanceof Array && val.length > 0) {
	          t = val[0];
	        }
	        if (t.nodeName) {
	          var xmlString = new XMLSerializer().serializeToString(t);
	          return this.formatXml(xmlString);
	        }
	        else
	          return JSON.stringify(val, null, 2);
	      }
	      else
	        return val;
	    }
	  };
	
	  SwaggerOperation.prototype['do'] = function (args, opts, callback, error) {
	    var key, param, params, possibleParams, req, value;
	    args = args || {};
	    opts = opts || {};
	
	    if ((typeof args) === 'function') {
	      error = opts;
	      callback = args;
	      args = {};
	    }
	    if ((typeof opts) === 'function') {
	      error = callback;
	      callback = opts;
	    }
	    if (error == null) {
	      error = function (xhr, textStatus, error) {
	        return log(xhr, textStatus, error);
	      };
	    }
	    if (callback == null) {
	      callback = function (response) {
	        var content;
	        content = null;
	        if (response != null) {
	          content = response.data;
	        } else {
	          content = 'no data';
	        }
	        return log('default callback: ' + content);
	      };
	    }
	    params = {};
	    params.headers = [];
	    if (args.headers != null) {
	      params.headers = args.headers;
	      delete args.headers;
	    }
	    // allow override from the opts
	    if(opts && opts.responseContentType) {
	      params.headers['Content-Type'] = opts.responseContentType;
	    }
	    if(opts && opts.requestContentType) {
	      params.headers['Accept'] = opts.requestContentType;
	    }
	
	    var possibleParams = [];
	    for (var i = 0; i < this.parameters.length; i++) {
	      var param = this.parameters[i];
	      if (param.paramType === 'header') {
	        if (typeof args[param.name] !== 'undefined')
	          params.headers[param.name] = args[param.name];
	      }
	      else if (param.paramType === 'form' || param.paramType.toLowerCase() === 'file')
	        possibleParams.push(param);
	      else if (param.paramType === 'body' && param.name !== 'body' && typeof args[param.name] !== 'undefined') {
	        if (args.body) {
	          throw new Error('Saw two body params in an API listing; expecting a max of one.');
	        }
	        args.body = args[param.name];
	      }
	    }
	
	    if (args.body != null) {
	      params.body = args.body;
	      delete args.body;
	    }
	
	    if (possibleParams) {
	      var key;
	      for (key in possibleParams) {
	        var value = possibleParams[key];
	        if (args[value.name]) {
	          params[value.name] = args[value.name];
	        }
	      }
	    }
	    req = new SwaggerRequest(this.method, this.urlify(args), params, opts, callback, error, this);
	    if (opts.mock != null) {
	      return req;
	    } else {
	      return true;
	    }
	  };
	
	  SwaggerOperation.prototype.pathJson = function () {
	    return this.path.replace('{format}', 'json');
	  };
	
	  SwaggerOperation.prototype.pathXml = function () {
	    return this.path.replace('{format}', 'xml');
	  };
	
	  SwaggerOperation.prototype.encodePathParam = function (pathParam) {
	    var encParts, part, parts, _i, _len;
	    pathParam = pathParam.toString();
	    if (pathParam.indexOf('/') === -1) {
	      return encodeURIComponent(pathParam);
	    } else {
	      parts = pathParam.split('/');
	      encParts = [];
	      for (_i = 0, _len = parts.length; _i < _len; _i++) {
	        part = parts[_i];
	        encParts.push(encodeURIComponent(part));
	      }
	      return encParts.join('/');
	    }
	  };
	
	  SwaggerOperation.prototype.urlify = function (args) {
	    var url = this.resource.basePath + this.pathJson();
	    var params = this.parameters;
	    for (var i = 0; i < params.length; i++) {
	      var param = params[i];
	      if (param.paramType === 'path') {
	        if (typeof args[param.name] !== 'undefined') {
	          // apply path params and remove from args
	          var reg = new RegExp('\\{\\s*?' + param.name + '.*?\\}(?=\\s*?(\\/?|$))', 'gi');
	          url = url.replace(reg, this.encodePathParam(args[param.name]));
	          delete args[param.name];
	        }
	        else
	          throw '' + param.name + ' is a required path param.';
	      }
	    }
	
	    var queryParams = '';
	    for (var i = 0; i < params.length; i++) {
	      var param = params[i];
	      if(param.paramType === 'query') {
	        if (queryParams !== '')
	          queryParams += '&';    
	        if (Array.isArray(param)) {
	          var j;   
	          var output = '';   
	          for(j = 0; j < param.length; j++) {    
	            if(j > 0)    
	              output += ',';   
	            output += encodeURIComponent(param[j]);    
	          }    
	          queryParams += encodeURIComponent(param.name) + '=' + output;    
	        }
	        else {
	          if (typeof args[param.name] !== 'undefined') {
	            queryParams += encodeURIComponent(param.name) + '=' + encodeURIComponent(args[param.name]);
	          } else {
	            if (param.required)
	              throw '' + param.name + ' is a required query param.';
	          }
	        }
	      }
	    }
	    if ((queryParams != null) && queryParams.length > 0)
	      url += '?' + queryParams;
	    return url;
	  };
	
	  SwaggerOperation.prototype.supportHeaderParams = function () {
	    return this.resource.api.supportHeaderParams;
	  };
	
	  SwaggerOperation.prototype.supportedSubmitMethods = function () {
	    return this.resource.api.supportedSubmitMethods;
	  };
	
	  SwaggerOperation.prototype.getQueryParams = function (args) {
	    return this.getMatchingParams(['query'], args);
	  };
	
	  SwaggerOperation.prototype.getHeaderParams = function (args) {
	    return this.getMatchingParams(['header'], args);
	  };
	
	  SwaggerOperation.prototype.getMatchingParams = function (paramTypes, args) {
	    var matchingParams = {};
	    var params = this.parameters;
	    for (var i = 0; i < params.length; i++) {
	      param = params[i];
	      if (args && args[param.name])
	        matchingParams[param.name] = args[param.name];
	    }
	    var headers = this.resource.api.headers;
	    var name;
	    for (name in headers) {
	      var value = headers[name];
	      matchingParams[name] = value;
	    }
	    return matchingParams;
	  };
	
	  SwaggerOperation.prototype.help = function () {
	    var msg = '';
	    var params = this.parameters;
	    for (var i = 0; i < params.length; i++) {
	      var param = params[i];
	      if (msg !== '')
	        msg += '\n';
	      msg += '* ' + param.name + (param.required ? ' (required)' : '') + " - " + param.description;
	    }
	    return msg;
	  };
	
	  SwaggerOperation.prototype.asCurl = function (args) {
	    var results = [];
	    var i;
	
	    var headers = SwaggerRequest.prototype.setHeaders(args, {}, this);    
	    for(i = 0; i < this.parameters.length; i++) {
	      var param = this.parameters[i];
	      if(param.paramType && param.paramType === 'header' && args[param.name]) {
	        headers[param.name] = args[param.name];
	      }
	    }
	
	    var key;
	    for (key in headers) {
	      results.push('--header "' + key + ': ' + headers[key] + '"');
	    }
	    return 'curl ' + (results.join(' ')) + ' ' + this.urlify(args);
	  };
	
	  SwaggerOperation.prototype.formatXml = function (xml) {
	    var contexp, formatted, indent, lastType, lines, ln, pad, reg, transitions, wsexp, _fn, _i, _len;
	    reg = /(>)(<)(\/*)/g;
	    wsexp = /[ ]*(.*)[ ]+\n/g;
	    contexp = /(<.+>)(.+\n)/g;
	    xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');
	    pad = 0;
	    formatted = '';
	    lines = xml.split('\n');
	    indent = 0;
	    lastType = 'other';
	    transitions = {
	      'single->single': 0,
	      'single->closing': -1,
	      'single->opening': 0,
	      'single->other': 0,
	      'closing->single': 0,
	      'closing->closing': -1,
	      'closing->opening': 0,
	      'closing->other': 0,
	      'opening->single': 1,
	      'opening->closing': 0,
	      'opening->opening': 1,
	      'opening->other': 1,
	      'other->single': 0,
	      'other->closing': -1,
	      'other->opening': 0,
	      'other->other': 0
	    };
	    _fn = function (ln) {
	      var fromTo, j, key, padding, type, types, value;
	      types = {
	        single: Boolean(ln.match(/<.+\/>/)),
	        closing: Boolean(ln.match(/<\/.+>/)),
	        opening: Boolean(ln.match(/<[^!?].*>/))
	      };
	      type = ((function () {
	        var _results;
	        _results = [];
	        for (key in types) {
	          value = types[key];
	          if (value) {
	            _results.push(key);
	          }
	        }
	        return _results;
	      })())[0];
	      type = type === void 0 ? 'other' : type;
	      fromTo = lastType + '->' + type;
	      lastType = type;
	      padding = '';
	      indent += transitions[fromTo];
	      padding = ((function () {
	        var _j, _ref5, _results;
	        _results = [];
	        for (j = _j = 0, _ref5 = indent; 0 <= _ref5 ? _j < _ref5 : _j > _ref5; j = 0 <= _ref5 ? ++_j : --_j) {
	          _results.push('  ');
	        }
	        return _results;
	      })()).join('');
	      if (fromTo === 'opening->closing') {
	        return formatted = formatted.substr(0, formatted.length - 1) + ln + '\n';
	      } else {
	        return formatted += padding + ln + '\n';
	      }
	    };
	    for (_i = 0, _len = lines.length; _i < _len; _i++) {
	      ln = lines[_i];
	      _fn(ln);
	    }
	    return formatted;
	  };
	
	  var SwaggerRequest = function (type, url, params, opts, successCallback, errorCallback, operation, execution) {
	    var _this = this;
	    var errors = [];
	    this.useJQuery = (typeof operation.resource.useJQuery !== 'undefined' ? operation.resource.useJQuery : null);
	    this.type = (type || errors.push('SwaggerRequest type is required (get/post/put/delete/patch/options).'));
	    this.url = (url || errors.push('SwaggerRequest url is required.'));
	    this.params = params;
	    this.opts = opts;
	    this.successCallback = (successCallback || errors.push('SwaggerRequest successCallback is required.'));
	    this.errorCallback = (errorCallback || errors.push('SwaggerRequest error callback is required.'));
	    this.operation = (operation || errors.push('SwaggerRequest operation is required.'));
	    this.execution = execution;
	    this.headers = (params.headers || {});
	
	    if (errors.length > 0) {
	      throw errors;
	    }
	
	    this.type = this.type.toUpperCase();
	
	    // set request, response content type headers
	    var headers = this.setHeaders(params, opts, this.operation);
	    var body = params.body;
	
	    // encode the body for form submits
	    if (headers['Content-Type']) {
	      var values = {};
	      var i;
	      var operationParams = this.operation.parameters;
	      for (i = 0; i < operationParams.length; i++) {
	        var param = operationParams[i];
	        if (param.paramType === 'form')
	          values[param.name] = param;
	      }
	
	      if (headers['Content-Type'].indexOf('application/x-www-form-urlencoded') === 0) {
	        var encoded = '';
	        var key, value;
	        for (key in values) {
	          value = this.params[key];
	          if (typeof value !== 'undefined') {
	            if (encoded !== '')
	              encoded += '&';
	            encoded += encodeURIComponent(key) + '=' + encodeURIComponent(value);
	          }
	        }
	        body = encoded;
	      }
	      else if (headers['Content-Type'].indexOf('multipart/form-data') === 0) {
	        // encode the body for form submits
	        var data = '';
	        var boundary = '----SwaggerFormBoundary' + Date.now();
	        var key, value;
	        for (key in values) {
	          value = this.params[key];
	          if (typeof value !== 'undefined') {
	            data += '--' + boundary + '\n';
	            data += 'Content-Disposition: form-data; name="' + key + '"';
	            data += '\n\n';
	            data += value + '\n';
	          }
	        }
	        data += '--' + boundary + '--\n';
	        headers['Content-Type'] = 'multipart/form-data; boundary=' + boundary;
	        body = data;
	      }
	    }
	
	    var obj;
	    if (!((this.headers != null) && (this.headers.mock != null))) {
	      obj = {
	        url: this.url,
	        method: this.type,
	        headers: headers,
	        body: body,
	        useJQuery: this.useJQuery,
	        on: {
	          error: function (response) {
	            return _this.errorCallback(response, _this.opts.parent);
	          },
	          redirect: function (response) {
	            return _this.successCallback(response, _this.opts.parent);
	          },
	          307: function (response) {
	            return _this.successCallback(response, _this.opts.parent);
	          },
	          response: function (response) {
	            return _this.successCallback(response, _this.opts.parent);
	          }
	        }
	      };
	
	      var status = false;
	      if (this.operation.resource && this.operation.resource.api && this.operation.resource.api.clientAuthorizations) {
	        // Get the client authorizations from the resource declaration
	        status = this.operation.resource.api.clientAuthorizations.apply(obj, this.operation.authorizations);
	      } else {
	        // Get the client authorization from the default authorization declaration
	        var e;
	        if (typeof window !== 'undefined') {
	          e = window;
	        } else {
	          e = exports;
	        }
	        status = e.authorizations.apply(obj, this.operation.authorizations);
	      }
	
	      if (opts.mock == null) {
	        if (status !== false) {
	          new SwaggerHttp().execute(obj);
	        } else {
	          obj.canceled = true;
	        }
	      } else {
	        return obj;
	      }
	    }
	    return obj;
	  };
	
	  SwaggerRequest.prototype.setHeaders = function (params, opts, operation) {
	    // default type
	    var accepts = opts.responseContentType || 'application/json';
	    var consumes = opts.requestContentType || 'application/json';
	
	    var allDefinedParams = operation.parameters;
	    var definedFormParams = [];
	    var definedFileParams = [];
	    var body = params.body;
	    var headers = {};
	
	    // get params from the operation and set them in definedFileParams, definedFormParams, headers
	    var i;
	    for (i = 0; i < allDefinedParams.length; i++) {
	      var param = allDefinedParams[i];
	      if (param.paramType === 'form')
	        definedFormParams.push(param);
	      else if (param.paramType === 'file')
	        definedFileParams.push(param);
	      else if (param.paramType === 'header' && this.params.headers) {
	        var key = param.name;
	        var headerValue = this.params.headers[param.name];
	        if (typeof this.params.headers[param.name] !== 'undefined')
	          headers[key] = headerValue;
	      }
	    }
	
	    // if there's a body, need to set the accepts header via requestContentType
	    if (body && (this.type === 'POST' || this.type === 'PUT' || this.type === 'PATCH' || this.type === 'DELETE')) {
	      if (this.opts.requestContentType)
	        consumes = this.opts.requestContentType;
	    } else {
	      // if any form params, content type must be set
	      if (definedFormParams.length > 0) {
	        if (definedFileParams.length > 0)
	          consumes = 'multipart/form-data';
	        else
	          consumes = 'application/x-www-form-urlencoded';
	      }
	      else if (this.type === 'DELETE')
	        body = '{}';
	      else if (this.type != 'DELETE')
	        consumes = null;
	    }
	
	    if (consumes && this.operation.consumes) {
	      if (this.operation.consumes.indexOf(consumes) === -1) {
	        log('server doesn\'t consume ' + consumes + ', try ' + JSON.stringify(this.operation.consumes));
	      }
	    }
	
	    if (this.opts && this.opts.responseContentType) {
	      accepts = this.opts.responseContentType;
	    } else {
	      accepts = 'application/json';
	    }
	    if (accepts && operation.produces) {
	      if (operation.produces.indexOf(accepts) === -1) {
	        log('server can\'t produce ' + accepts);
	      }
	    }
	
	    if ((consumes && body !== '') || (consumes === 'application/x-www-form-urlencoded'))
	      headers['Content-Type'] = consumes;
	    if (accepts)
	      headers['Accept'] = accepts;
	    return headers;
	  }
	
	  /**
	   * SwaggerHttp is a wrapper for executing requests
	   */
	  var SwaggerHttp = function () { };
	
	  SwaggerHttp.prototype.execute = function (obj) {
	    if (obj && (typeof obj.useJQuery === 'boolean'))
	      this.useJQuery = obj.useJQuery;
	    else
	      this.useJQuery = this.isIE8();
	
	    if (this.useJQuery)
	      return new JQueryHttpClient().execute(obj);
	    else
	      return new ShredHttpClient().execute(obj);
	  }
	
	  SwaggerHttp.prototype.isIE8 = function () {
	    var detectedIE = false;
	    if (typeof navigator !== 'undefined' && navigator.userAgent) {
	      nav = navigator.userAgent.toLowerCase();
	      if (nav.indexOf('msie') !== -1) {
	        var version = parseInt(nav.split('msie')[1]);
	        if (version <= 8) {
	          detectedIE = true;
	        }
	      }
	    }
	    return detectedIE;
	  };
	
	  /*
	   * JQueryHttpClient lets a browser take advantage of JQuery's cross-browser magic.
	   * NOTE: when jQuery is available it will export both '$' and 'jQuery' to the global space.
	   *     Since we are using closures here we need to alias it for internal use.
	   */
	  var JQueryHttpClient = function (options) {
	    this.options = options || {};
	    if (!jQuery) {
	      var jQuery = window.jQuery;
	    }
	  }
	
	  JQueryHttpClient.prototype.execute = function (obj) {
	    var cb = obj.on;
	    var request = obj;
	
	    obj.type = obj.method;
	    obj.cache = false;
	
	    obj.beforeSend = function (xhr) {
	      var key, results;
	      if (obj.headers) {
	        results = [];
	        var key;
	        for (key in obj.headers) {
	          if (key.toLowerCase() === 'content-type') {
	            results.push(obj.contentType = obj.headers[key]);
	          } else if (key.toLowerCase() === 'accept') {
	            results.push(obj.accepts = obj.headers[key]);
	          } else {
	            results.push(xhr.setRequestHeader(key, obj.headers[key]));
	          }
	        }
	        return results;
	      }
	    };
	
	    obj.data = obj.body;
	    obj.complete = function (response) {
	      var headers = {},
	          headerArray = response.getAllResponseHeaders().split('\n');
	
	      for (var i = 0; i < headerArray.length; i++) {
	        var toSplit = headerArray[i].trim();
	        if (toSplit.length === 0)
	          continue;
	        var separator = toSplit.indexOf(':');
	        if (separator === -1) {
	          // Name but no value in the header
	          headers[toSplit] = null;
	          continue;
	        }
	        var name = toSplit.substring(0, separator).trim(),
	            value = toSplit.substring(separator + 1).trim();
	        headers[name] = value;
	      }
	
	      var out = {
	        url: request.url,
	        method: request.method,
	        status: response.status,
	        data: response.responseText,
	        headers: headers
	      };
	
	      var contentType = (headers['content-type'] || headers['Content-Type'] || null)
	
	      if (contentType != null) {
	        if (contentType.indexOf('application/json') == 0 || contentType.indexOf('+json') > 0) {
	          if (response.responseText && response.responseText !== '')
	            out.obj = JSON.parse(response.responseText);
	          else
	            out.obj = {}
	        }
	      }
	
	      if (response.status >= 200 && response.status < 300)
	        cb.response(out);
	      else if (response.status === 0 || (response.status >= 400 && response.status < 599))
	        cb.error(out);
	      else
	        return cb.response(out);
	    };
	
	    jQuery.support.cors = true;
	    return jQuery.ajax(obj);
	  }
	
	  /*
	   * ShredHttpClient is a light-weight, node or browser HTTP client
	   */
	  var ShredHttpClient = function (options) {
	    this.options = (options || {});
	    this.isInitialized = false;
	
	    if (typeof window !== 'undefined') {
	      this.Shred = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./shred\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	      this.content = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./shred/content\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    }
	    else
	      this.Shred = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"shred\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    this.shred = new this.Shred();
	  }
	
	  ShredHttpClient.prototype.initShred = function () {
	    this.isInitialized = true;
	    this.registerProcessors(this.shred);
	  }
	
	  ShredHttpClient.prototype.registerProcessors = function () {
	    var identity = function (x) {
	      return x;
	    };
	    var toString = function (x) {
	      return x.toString();
	    };
	
	    if (typeof window !== 'undefined') {
	      this.content.registerProcessor(['application/json; charset=utf-8', 'application/json', 'json'], {
	        parser: identity,
	        stringify: toString
	      });
	    } else {
	      this.Shred.registerProcessor(['application/json; charset=utf-8', 'application/json', 'json'], {
	        parser: identity,
	        stringify: toString
	      });
	    }
	  }
	
	  ShredHttpClient.prototype.execute = function (obj) {
	    if (!this.isInitialized)
	      this.initShred();
	
	    var cb = obj.on, res;
	
	    var transform = function (response) {
	      var out = {
	        headers: response._headers,
	        url: response.request.url,
	        method: response.request.method,
	        status: response.status,
	        data: response.content.data
	      };
	
	      var headers = response._headers.normalized || response._headers;
	      var contentType = (headers['content-type'] || headers['Content-Type'] || null)
	      if (contentType != null) {
	        if (contentType.indexOf('application/json') == 0 || contentType.indexOf('+json') > 0) {
	          if (response.content.data && response.content.data !== '')
	            try {
	              out.obj = JSON.parse(response.content.data);
	            }
	            catch (ex) {
	              // do not set out.obj
	              log('unable to parse JSON content');
	            }
	          else
	            out.obj = {}
	        }
	      }
	      return out;
	    };
	
	    // Transform an error into a usable response-like object
	    var transformError = function (error) {
	      var out = {
	        // Default to a status of 0 - The client will treat this as a generic permissions sort of error
	        status: 0,
	        data: error.message || error
	      };
	
	      if (error.code) {
	        out.obj = error;
	
	        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
	          // We can tell the client that this should be treated as a missing resource and not as a permissions thing
	          out.status = 404;
	        }
	      }
	
	      return out;
	    };
	
	    var res = {
	      error: function (response) {
	        if (obj)
	          return cb.error(transform(response));
	      },
	      // Catch the Shred error raised when the request errors as it is made (i.e. No Response is coming)
	      request_error: function (err) {
	        if (obj)
	          return cb.error(transformError(err));
	      },
	      response: function (response) {
	        if (obj)
	          return cb.response(transform(response));
	      }
	    };
	    if (obj) {
	      obj.on = res;
	    }
	    return this.shred.request(obj);
	  };
	
	  /**
	   * SwaggerAuthorizations applys the correct authorization to an operation being executed
	   */
	  var SwaggerAuthorizations = function (name, auth) {
	    this.authz = {};
	    if(name && auth) {
	      this.authz[name] = auth;
	    }
	  };
	
	  SwaggerAuthorizations.prototype.add = function (name, auth) {
	    this.authz[name] = auth;
	    return auth;
	  };
	
	  SwaggerAuthorizations.prototype.remove = function (name) {
	    return delete this.authz[name];
	  };
	
	  SwaggerAuthorizations.prototype.apply = function (obj, authorizations) {
	    var status = null;
	    var key, value, result;
	
	    // if the "authorizations" key is undefined, or has an empty array, add all keys
	    if (typeof authorizations === 'undefined' || Object.keys(authorizations).length == 0) {
	      for (key in this.authz) {
	        value = this.authz[key];
	        result = value.apply(obj, authorizations);
	        if (result === true)
	          status = true;
	      }
	    }
	    else {
	      for (name in authorizations) {
	        for (key in this.authz) {
	          if (key == name) {
	            value = this.authz[key];
	            result = value.apply(obj, authorizations);
	            if (result === true)
	              status = true;
	          }
	        }
	      }
	    }
	
	    return status;
	  };
	
	  /**
	   * ApiKeyAuthorization allows a query param or header to be injected
	   */
	  var ApiKeyAuthorization = function (name, value, type, delimiter) {
	    this.name = name;
	    this.value = value;
	    this.type = type;
	    this.delimiter = delimiter;
	  };
	
	  ApiKeyAuthorization.prototype.apply = function (obj) {
	    if (this.type === 'query') {
	      if (obj.url.indexOf('?') > 0)
	        obj.url = obj.url + '&' + this.name + '=' + this.value;
	      else
	        obj.url = obj.url + '?' + this.name + '=' + this.value;
	      return true;
	    } else if (this.type === 'header') {
	      if (typeof obj.headers[this.name] !== 'undefined') {
	        if (typeof this.delimiter !== 'undefined')
	          obj.headers[this.name] = obj.headers[this.name] + this.delimiter + this.value;
	      }
	      else
	        obj.headers[this.name] = this.value;
	      return true;
	    }
	  };
	
	  var CookieAuthorization = function (cookie) {
	    this.cookie = cookie;
	  }
	
	  CookieAuthorization.prototype.apply = function (obj) {
	    obj.cookieJar = obj.cookieJar || CookieJar();
	    obj.cookieJar.setCookie(this.cookie);
	    return true;
	  }
	
	  /**
	   * Password Authorization is a basic auth implementation
	   */
	  var PasswordAuthorization = function (name, username, password) {
	    this.name = name;
	    this.username = username;
	    this.password = password;
	    this._btoa = null;
	    if (typeof window !== 'undefined')
	      this._btoa = btoa;
	    else
	      this._btoa = __webpack_require__(4);
	  };
	
	  PasswordAuthorization.prototype.apply = function (obj) {
	    var base64encoder = this._btoa;
	    obj.headers['Authorization'] = 'Basic ' + base64encoder(this.username + ':' + this.password);
	    return true;
	  };
	
	  var e = (typeof window !== 'undefined' ? window : exports);
	
	  var sampleModels = {};
	
	  e.SampleModels = sampleModels;
	  e.SwaggerHttp = SwaggerHttp;
	  e.SwaggerRequest = SwaggerRequest;
	  e.SwaggerAuthorizations = SwaggerAuthorizations;
	  e.authorizations = new SwaggerAuthorizations();
	  e.ApiKeyAuthorization = ApiKeyAuthorization;
	  e.PasswordAuthorization = PasswordAuthorization;
	  e.CookieAuthorization = CookieAuthorization;
	  e.JQueryHttpClient = JQueryHttpClient;
	  e.ShredHttpClient = ShredHttpClient;
	  e.SwaggerOperation = SwaggerOperation;
	  e.SwaggerModel = SwaggerModel;
	  e.SwaggerModelProperty = SwaggerModelProperty;
	  e.SwaggerResource = SwaggerResource;
	  e.SwaggerApi = SwaggerApi;
	
	  e.log = log;
	
	})();
	
	
	/*** EXPORTS FROM exports-loader ***/
	exports["SwaggerApi"] = (window.SwaggerApi);
	exports["ApiKeyAuthorization"] = (window.ApiKeyAuthorization);
	exports["authorizations"] = (window.authorizations);

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {(function () {
	  "use strict";
	
	  function btoa(str) {
	    var buffer
	      ;
	
	    if (str instanceof Buffer) {
	      buffer = str;
	    } else {
	      buffer = new Buffer(str.toString(), 'binary');
	    }
	
	    return buffer.toString('base64');
	  }
	
	  module.exports = btoa;
	}());
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5).Buffer))

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer, global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */
	
	var base64 = __webpack_require__(6)
	var ieee754 = __webpack_require__(7)
	var isArray = __webpack_require__(8)
	
	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation
	
	var rootParent = {}
	
	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
	 *     on objects.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.
	
	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()
	
	function typedArraySupport () {
	  function Bar () {}
	  try {
	    var arr = new Uint8Array(1)
	    arr.foo = function () { return 42 }
	    arr.constructor = Bar
	    return arr.foo() === 42 && // typed array instances can be augmented
	        arr.constructor === Bar && // constructor can be set
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}
	
	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}
	
	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (arg) {
	  if (!(this instanceof Buffer)) {
	    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
	    if (arguments.length > 1) return new Buffer(arg, arguments[1])
	    return new Buffer(arg)
	  }
	
	  this.length = 0
	  this.parent = undefined
	
	  // Common case.
	  if (typeof arg === 'number') {
	    return fromNumber(this, arg)
	  }
	
	  // Slightly less common case.
	  if (typeof arg === 'string') {
	    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
	  }
	
	  // Unusual.
	  return fromObject(this, arg)
	}
	
	function fromNumber (that, length) {
	  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < length; i++) {
	      that[i] = 0
	    }
	  }
	  return that
	}
	
	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'
	
	  // Assumption: byteLength() return value is always < kMaxLength.
	  var length = byteLength(string, encoding) | 0
	  that = allocate(that, length)
	
	  that.write(string, encoding)
	  return that
	}
	
	function fromObject (that, object) {
	  if (Buffer.isBuffer(object)) return fromBuffer(that, object)
	
	  if (isArray(object)) return fromArray(that, object)
	
	  if (object == null) {
	    throw new TypeError('must start with number, buffer, array or string')
	  }
	
	  if (typeof ArrayBuffer !== 'undefined') {
	    if (object.buffer instanceof ArrayBuffer) {
	      return fromTypedArray(that, object)
	    }
	    if (object instanceof ArrayBuffer) {
	      return fromArrayBuffer(that, object)
	    }
	  }
	
	  if (object.length) return fromArrayLike(that, object)
	
	  return fromJsonObject(that, object)
	}
	
	function fromBuffer (that, buffer) {
	  var length = checked(buffer.length) | 0
	  that = allocate(that, length)
	  buffer.copy(that, 0, 0, length)
	  return that
	}
	
	function fromArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}
	
	// Duplicate of fromArray() to keep fromArray() monomorphic.
	function fromTypedArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  // Truncating the elements is probably not what people expect from typed
	  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
	  // of the old Buffer constructor.
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}
	
	function fromArrayBuffer (that, array) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    array.byteLength
	    that = Buffer._augment(new Uint8Array(array))
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromTypedArray(that, new Uint8Array(array))
	  }
	  return that
	}
	
	function fromArrayLike (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}
	
	// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
	// Returns a zero-length buffer for inputs that don't conform to the spec.
	function fromJsonObject (that, object) {
	  var array
	  var length = 0
	
	  if (object.type === 'Buffer' && isArray(object.data)) {
	    array = object.data
	    length = checked(array.length) | 0
	  }
	  that = allocate(that, length)
	
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}
	
	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	}
	
	function allocate (that, length) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = Buffer._augment(new Uint8Array(length))
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that.length = length
	    that._isBuffer = true
	  }
	
	  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
	  if (fromPool) that.parent = rootParent
	
	  return that
	}
	
	function checked (length) {
	  // Note: cannot use `length < kMaxLength` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}
	
	function SlowBuffer (subject, encoding) {
	  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)
	
	  var buf = new Buffer(subject, encoding)
	  delete buf.parent
	  return buf
	}
	
	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}
	
	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }
	
	  if (a === b) return 0
	
	  var x = a.length
	  var y = b.length
	
	  var i = 0
	  var len = Math.min(x, y)
	  while (i < len) {
	    if (a[i] !== b[i]) break
	
	    ++i
	  }
	
	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }
	
	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}
	
	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}
	
	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')
	
	  if (list.length === 0) {
	    return new Buffer(0)
	  }
	
	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; i++) {
	      length += list[i].length
	    }
	  }
	
	  var buf = new Buffer(length)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}
	
	function byteLength (string, encoding) {
	  if (typeof string !== 'string') string = '' + string
	
	  var len = string.length
	  if (len === 0) return 0
	
	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'binary':
	      // Deprecated
	      case 'raw':
	      case 'raws':
	        return len
	      case 'utf8':
	      case 'utf-8':
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength
	
	// pre-set for values that may exist in the future
	Buffer.prototype.length = undefined
	Buffer.prototype.parent = undefined
	
	function slowToString (encoding, start, end) {
	  var loweredCase = false
	
	  start = start | 0
	  end = end === undefined || end === Infinity ? this.length : end | 0
	
	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''
	
	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)
	
	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)
	
	      case 'ascii':
	        return asciiSlice(this, start, end)
	
	      case 'binary':
	        return binarySlice(this, start, end)
	
	      case 'base64':
	        return base64Slice(this, start, end)
	
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)
	
	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	
	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}
	
	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}
	
	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}
	
	Buffer.prototype.compare = function compare (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return 0
	  return Buffer.compare(this, b)
	}
	
	Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
	  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
	  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
	  byteOffset >>= 0
	
	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1
	
	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)
	
	  if (typeof val === 'string') {
	    if (val.length === 0) return -1 // special case: looking for empty string always fails
	    return String.prototype.indexOf.call(this, val, byteOffset)
	  }
	  if (Buffer.isBuffer(val)) {
	    return arrayIndexOf(this, val, byteOffset)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset)
	  }
	
	  function arrayIndexOf (arr, val, byteOffset) {
	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arr.length; i++) {
	      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
	      } else {
	        foundIndex = -1
	      }
	    }
	    return -1
	  }
	
	  throw new TypeError('val must be string, number or Buffer')
	}
	
	// `get` is deprecated
	Buffer.prototype.get = function get (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}
	
	// `set` is deprecated
	Buffer.prototype.set = function set (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}
	
	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }
	
	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')
	
	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) throw new Error('Invalid hex string')
	    buf[offset + i] = parsed
	  }
	  return i
	}
	
	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}
	
	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}
	
	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}
	
	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}
	
	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}
	
	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    var swap = encoding
	    encoding = offset
	    offset = length | 0
	    length = swap
	  }
	
	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining
	
	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('attempt to write outside buffer bounds')
	  }
	
	  if (!encoding) encoding = 'utf8'
	
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)
	
	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)
	
	      case 'ascii':
	        return asciiWrite(this, string, offset, length)
	
	      case 'binary':
	        return binaryWrite(this, string, offset, length)
	
	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)
	
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)
	
	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	
	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}
	
	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}
	
	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []
	
	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1
	
	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint
	
	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }
	
	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }
	
	    res.push(codePoint)
	    i += bytesPerSequence
	  }
	
	  return decodeCodePointsArray(res)
	}
	
	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000
	
	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }
	
	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}
	
	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)
	
	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}
	
	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)
	
	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}
	
	function hexSlice (buf, start, end) {
	  var len = buf.length
	
	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len
	
	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}
	
	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}
	
	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end
	
	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }
	
	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }
	
	  if (end < start) end = start
	
	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }
	
	  if (newBuf.length) newBuf.parent = this.parent || this
	
	  return newBuf
	}
	
	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}
	
	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	
	  return val
	}
	
	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }
	
	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }
	
	  return val
	}
	
	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}
	
	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}
	
	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}
	
	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}
	
	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}
	
	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80
	
	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)
	
	  return val
	}
	
	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80
	
	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)
	
	  return val
	}
	
	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}
	
	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}
	
	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}
	
	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}
	
	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}
	
	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}
	
	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}
	
	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}
	
	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}
	
	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	}
	
	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)
	
	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)
	
	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}
	
	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}
	
	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}
	
	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}
	
	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)
	
	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }
	
	  var i = 0
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)
	
	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }
	
	  var i = byteLength - 1
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}
	
	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}
	
	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	  if (offset < 0) throw new RangeError('index out of range')
	}
	
	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}
	
	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}
	
	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}
	
	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}
	
	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}
	
	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}
	
	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start
	
	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0
	
	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')
	
	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }
	
	  var len = end - start
	  var i
	
	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; i--) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; i++) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), targetStart)
	  }
	
	  return len
	}
	
	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length
	
	  if (end < start) throw new RangeError('end < start')
	
	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return
	
	  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')
	
	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }
	
	  return this
	}
	
	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}
	
	// HELPER FUNCTIONS
	// ================
	
	var BP = Buffer.prototype
	
	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function _augment (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true
	
	  // save reference to original Uint8Array set method before overwriting
	  arr._set = arr.set
	
	  // deprecated
	  arr.get = BP.get
	  arr.set = BP.set
	
	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.indexOf = BP.indexOf
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUIntLE = BP.readUIntLE
	  arr.readUIntBE = BP.readUIntBE
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readIntLE = BP.readIntLE
	  arr.readIntBE = BP.readIntBE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUIntLE = BP.writeUIntLE
	  arr.writeUIntBE = BP.writeUIntBE
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeIntLE = BP.writeIntLE
	  arr.writeIntBE = BP.writeIntBE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer
	
	  return arr
	}
	
	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g
	
	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}
	
	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}
	
	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}
	
	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []
	
	  for (var i = 0; i < length; i++) {
	    codePoint = string.charCodeAt(i)
	
	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }
	
	        // valid lead
	        leadSurrogate = codePoint
	
	        continue
	      }
	
	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }
	
	      // valid surrogate pair
	      codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }
	
	    leadSurrogate = null
	
	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }
	
	  return bytes
	}
	
	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}
	
	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break
	
	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }
	
	  return byteArray
	}
	
	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}
	
	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5).Buffer, (function() { return this; }())))

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	
	;(function (exports) {
		'use strict';
	
	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array
	
		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
		var PLUS_URL_SAFE = '-'.charCodeAt(0)
		var SLASH_URL_SAFE = '_'.charCodeAt(0)
	
		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS ||
			    code === PLUS_URL_SAFE)
				return 62 // '+'
			if (code === SLASH ||
			    code === SLASH_URL_SAFE)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}
	
		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr
	
			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}
	
			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0
	
			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)
	
			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length
	
			var L = 0
	
			function push (v) {
				arr[L++] = v
			}
	
			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}
	
			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}
	
			return arr
		}
	
		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length
	
			function encode (num) {
				return lookup.charAt(num)
			}
	
			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}
	
			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}
	
			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}
	
			return output
		}
	
		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}( false ? (this.base64js = {}) : exports))


/***/ },
/* 7 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]
	
	  i += d
	
	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
	
	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
	
	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}
	
	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0
	
	  value = Math.abs(value)
	
	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }
	
	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }
	
	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
	
	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
	
	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 8 */
/***/ function(module, exports) {

	
	/**
	 * isArray
	 */
	
	var isArray = Array.isArray;
	
	/**
	 * toString
	 */
	
	var str = Object.prototype.toString;
	
	/**
	 * Whether or not the given `val`
	 * is an array.
	 *
	 * example:
	 *
	 *        isArray([]);
	 *        // > true
	 *        isArray(arguments);
	 *        // > false
	 *        isArray('');
	 *        // > false
	 *
	 * @param {mixed} val
	 * @return {bool}
	 */
	
	module.exports = isArray || function (val) {
	  return !! val && '[object Array]' == str.call(val);
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1);
	var bluebird = __webpack_require__(2);
	
	function NameMap() {
	  this.removePrefix = '';
	  this.titlecase = true;
	}
	
	NameMap.prototype = {
	
	  map: function(item) {
	    return this._map(item.path);
	  },
	
	  _map: function(value, options) {
	    var removePrefix = _.result(options, 'removePrefix') || this.removePrefix;
	    value = value.replace(removePrefix, '');
	
	    var titlecase = _.result(options, 'titlecase') || this.titlecase;
	    if (titlecase) {
	      value = _.camelCase(value);
	    }
	
	    return value;
	  },
	
	};
	
	function ResourceNameMap() {
	  NameMap.call(this);
	  this.removePrefix = 'api/v1/';
	}
	
	ResourceNameMap.prototype = Object.create(NameMap.prototype);
	
	ResourceNameMap.prototype.remap = function(api, resourceArray) {
	  api.apis = {};
	  resourceArray.forEach(function(resource) {
	    var name = this.map(resource);
	    api.apis[name] = resource;
	
	    new OperationNameMap().remap(resource, resource.operationsArray);
	  }, this);
	};
	
	function OperationNameMap() {
	  NameMap.call(this);
	}
	
	OperationNameMap.prototype = Object.create(NameMap.prototype);
	
	var operationRenames = {
	  delete: {
	    'id': 'delete',
	  },
	  get: {
	    '': 'all',
	    'id': 'byId',
	  },
	  patch: {
	    'id': 'patch',
	  },
	  post: {
	    '': 'create',
	    'idRecover': 'recoverById',
	  },
	  put: {
	    'id': 'update',
	  },
	};
	
	OperationNameMap.prototype.map = function(operation) {
	  var name = this._map(operation.path, { removePrefix: operation.resource.path })
	    .replace(/\//g, '')
	    .replace('{id}', 'id');
	
	  var method = operation.method.toLowerCase();
	
	  if (operationRenames[method] && operationRenames[method][name]) {
	    name = operationRenames[method][name];
	  }
	
	  return name;
	};
	
	OperationNameMap.prototype.bind = function(operation) {
	  return function (args, opts) {
	    if (!args) {
	      args = {};
	    }
	
	    var params = operation.parameters;
	    var i;
	    var key;
	    for (i = 0; i < params.length; i++) {
	      var param = params[i];
	
	      if (param.name === 'accountId' && !args.accountId) {
	        args.accountId = operation.resource.api.accountId;
	      }
	
	      if (param.paramType === 'body' && param.name === 'body' && !args.body) {
	        // Copy all arguments. With body style arguments, all arguments not
	        // listed in operation parameters will be passed on the body since
	        // it'll be the only thing sent.
	        var body = {};
	        for (key in args) {
	          var bodyParam = true;
	          var j;
	          for (j = 0; j < params.length; j++) {
	            if (params[j].name === key) {
	              bodyParam = false;
	            }
	          }
	          if (bodyParam) {
	            body[key] = args[key];
	            delete args[key];
	          }
	        }
	        args.body = body;
	      }
	
	      if (param.name === 'body' && param.type) {
	        var type = operation.resource.models[param.type];
	        for (key in type.properties) {
	          var prop = type.properties[key];
	          if (prop.name === 'accountId') {
	            if (args.body && !args.body.accountId) {
	              args.body.accountId = operation.resource.api.accountId;
	            }
	          }
	        }
	      }
	
	      if (
	        // Very explicitly test if we should stringify body in case the
	        // operation prefers another encoding.
	        param.paramType === 'body' && param.name === 'body' &&
	        typeof args.body === 'object' && operation.consumes &&
	        operation.consumes.length === 1 &&
	        operation.consumes[0] === 'application/json'
	      ) {
	        // swagger-client 2.0.x does not JSON stringify body but can encode
	        // other formats (multipart/form for example)
	        args.body = JSON.stringify(args.body);
	      }
	    }
	
	    return new bluebird(function(resolve, reject) {
	      operation.do(args, opts, resolve, reject);
	    });
	  };
	};
	
	OperationNameMap.prototype.remap = function(resource, operationArray) {
	  operationArray.forEach(function(operation) {
	    delete resource[operation.nickname];
	  });
	
	  operationArray.forEach(function(operation) {
	    var name = this.map(operation);
	
	    if (name) {
	      resource[name] = this.bind(operation);
	    }
	  }, this);
	};
	
	module.exports = {
	  ResourceNameMap: ResourceNameMap,
	  OperationNameMap: OperationNameMap,
	};


/***/ }
/******/ ])
});
;
//# sourceMappingURL=blueprint-client.js.map