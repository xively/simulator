module.exports =
/******/ (function(modules) { // webpackBootstrap
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

	var ResourceNameMap = __webpack_require__(4).ResourceNameMap;

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

	      url: options.docsData ? null : (options.docsUrl || 'https://blueprint.xively.com/docs'),
	      authorizations: options.authorization ?
	        new SwaggerClient.ApiKeyAuthorization('authorization', options.authorization, 'header') :
	        SwaggerClient.authorizations,

	      useJQuery: options.useJQuery !== undefined ? options.useJQuery : typeof window !== 'undefined',

	      success: function() {
	        if (options.docsData) { return; }

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

	    if (options.docsData) {
	      var apis = options.docsData.apis;
	      options.docsData.apis = [];
	      _this.url = options.docsUrl || 'https://blueprint.xively.com/docs';
	      _this.buildFromSpec(options.docsData);
	      for (var i = 0; i < apis.length; i++) {
	        _this.resourcePath = apis[i].resourcePath;
	        var res = new SwaggerClient.SwaggerResource(apis[i], _this);
	        _this.apisArray.push(res);
	      }
	      _this.resourcePath = null;
	      new ResourceNameMap().remap(_this, _this.apisArray);
	      resolve(_this);
	    }
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

	module.exports = require("lodash");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("bluebird");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("swagger-client");

/***/ },
/* 4 */
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
/******/ ]);
//# sourceMappingURL=blueprint-client-node.js.map
