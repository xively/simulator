var Promise = require('bluebird');
var request = require('request');

function cleanHabaneroHost(host){
	if(host.indexOf('.') === -1){
		host = host+'.herokuapp.com';
	}
	if(!host.startsWith('http')){
		host = 'https://'+host;
	}
	if(!host.endsWith('/')){
		host = host + '/';
	}
	return host;
}

function doHabaneroLogin(habanero_base_url) {
    return new Promise(function(resolve, reject) {
		request({
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
		},
		function(err,httpResponse,body){ 
			if(err){
				reject(err);
			}
			if (httpResponse.statusCode != 200) { 
			    console.log("Error provisioning habanero app: "+process.evn.HABANERO_HOST );
			    console.log(JSON.stringify(response));
			}
		  	resolve(body);
		});
    });
}

function login(req, res){
	var habanero_base_url = cleanHabaneroHost(process.env.HABANERO_HOST);
	doHabaneroLogin(habanero_base_url).then(function(loginResult){
		var ticket = new Buffer(loginResult).toString('base64');
		var loginUrl = habanero_base_url + 'enableSession?ticket='+ticket;
		res.redirect(loginUrl);
	});

}

module.exports = {
	login: login
};