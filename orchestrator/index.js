const request = require('request-promise');
const HABANERO = require('node-red-habanero');

const HABANERO_ADMIN_ROOT = '/orchestrator';
const HABANERO_NODE_ROOT  = '/orchestrator-api';

function init(app){
	// Habanero
	// need to wrap express app, as habanero expects an http server
	var httpServer = require('http').createServer(app);
	var habaneroSettings = require('../node_modules/node-red-habanero/settings');
	habaneroSettings.httpAdminRoot = HABANERO_ADMIN_ROOT;
	habaneroSettings.httpNodeRoot = HABANERO_NODE_ROOT;
	// Initialise the runtime with a server and settings
	HABANERO.init(httpServer, habaneroSettings);
	// Serve the editor UI
	app.use(habaneroSettings.httpAdminRoot, HABANERO.httpAdmin);
	// Serve the http nodes UI
	app.use(habaneroSettings.httpNodeRoot, HABANERO.httpNode);
	// auto-login url to habanero
	app.get('/gotoHabanero', gotoHabanero);

	HABANERO.start();
}

function getHabaneroBaseUrl(req){
	var baseUrl = req.protocol + '://' + req.get('host') + HABANERO_ADMIN_ROOT +'/';
	return baseUrl;
}

function doHabaneroLogin(habanero_base_url) {
	return request({
      	url: habanero_base_url + 'auth/token',
		method: 'POST',
		form: {
		  client_id: "node-red-editor",
		  grant_type: "password",
		  scope:"",
		  username: process.env.XIVELY_ACCOUNT_USER_NAME,
		  password: process.env.XIVELY_ACCOUNT_USER_PASSWORD,
		  accountId: process.env.XIVELY_ACCOUNT_ID,
		  appId: process.env.XIVELY_APP_ID,
		  accessToken: process.env.XIVELY_APP_TOKEN,
		  SALESFORCE_USER: process.env.SALESFORCE_USER,
		  SALESFORCE_PASSWORD: process.env.SALESFORCE_PASSWORD,
		  SALESFORCE_TOKEN: process.env.SALESFORCE_TOKEN
		}
    })
	  .catch((error) => {
	    console.error(error)
	  });
}

function gotoHabanero(req, res){
	var habanero_base_url = getHabaneroBaseUrl(req);
	doHabaneroLogin(habanero_base_url).then(function(loginResult){
		var ticket = new Buffer(loginResult).toString('base64');
		var loginUrl = habanero_base_url + 'enableSession?ticket='+ticket+'&adminRoot='+encodeURIComponent(HABANERO_ADMIN_ROOT);
		res.redirect(loginUrl);
	});
}

module.exports = {
	init: init,
	HABANERO_ADMIN_ROOT:HABANERO_ADMIN_ROOT,
	HABANERO_NODE_ROOT:HABANERO_NODE_ROOT

};