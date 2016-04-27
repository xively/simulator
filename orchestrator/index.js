const request = require('request-promise');
const HABANERO = require('node-red-habanero');

const HABANERO_ADMIN_ROOT = '/orchestrator';
const HABANERO_NODE_ROOT  = '/orchestrator-api';

function init(server, app){
	// Habanero
	var habaneroSettings = require('../node_modules/node-red-habanero/settings');
	habaneroSettings.httpAdminRoot = HABANERO_ADMIN_ROOT;
	habaneroSettings.httpNodeRoot = HABANERO_NODE_ROOT;
	// Initialise the runtime with a server and settings
	HABANERO.init(server, habaneroSettings);
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
      	uri: habanero_base_url + 'auth/token',
		method: 'POST',
		form: {
		  FROM_CONCARIA: 'true',
		  client_id: "node-red-editor",
		  grant_type: "password",
		  scope:"",
		  username: process.env.XIVELY_ACCOUNT_USER_NAME,
		  password: process.env.XIVELY_ACCOUNT_USER_PASSWORD,
		  accountId: process.env.XIVELY_ACCOUNT_ID,
		  appId: process.env.XIVELY_APP_ID,
		  XIVELY_ACCOUNT_USER_IDM_ID:process.env.XIVELY_ACCOUNT_USER_IDM_ID,
		  XIVELY_ACCOUNT_USER_BP_ID:process.env.XIVELY_ACCOUNT_USER_BP_ID,
		  SALESFORCE_USER: process.env.SALESFORCE_USER,
		  SALESFORCE_PASSWORD: process.env.SALESFORCE_PASSWORD,
		  SALESFORCE_TOKEN: process.env.SALESFORCE_TOKEN
		}
    });  
}

function gotoHabanero(req, res){
	var habanero_base_url = getHabaneroBaseUrl(req);
	doHabaneroLogin(habanero_base_url).then(function(loginResult){
		var ticket = new Buffer(loginResult).toString('base64');
		var loginUrl = habanero_base_url + 'enableSession?ticket='+ticket+'&adminRoot='+encodeURIComponent(HABANERO_ADMIN_ROOT);
		res.redirect(loginUrl);
	}).catch((error) => {
		console.log("Error loging into orchestorator");
	    //console.error(error)
	  });;
}

module.exports = {
	init: init,
	HABANERO_ADMIN_ROOT:HABANERO_ADMIN_ROOT,
	HABANERO_NODE_ROOT:HABANERO_NODE_ROOT

};