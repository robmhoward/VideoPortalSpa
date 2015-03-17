var port = process.env.PORT || 1943;
var express = require('express');
var https = require('https');

var tokenCache = {};

var app = express();

//edog
var client_id = "0e77e4f8-e84b-462c-9071-8c5aa2e51677";
var client_secret = "3J8jWJX3xo5XeQnxSrVjxhwHR4bFEUruDlphxbiXzWw=";
var login_host = "login.windows-ppe.net";
var graph_host = "graph.ppe.windows.net";
/*
//prod
var client_id = "50f0fbd8-0632-45e5-92dc-b692bdaf5dbf";
var client_secret = "e/zEjKeSVaHVUlfqf2ptLcqnpQSMBpEBi3428LewghQ=";
*/

app.use('/', express.static(__dirname + "/public"));

app.get('/', function(request, response) {
	var user = request.cookies.currentUser;
	if (user && user.oid && tokenCache[user.oid]) {
		//response.writeHead(200, {"Content-Type": "text/plain"});
		//response.write("Hello " + user.given_name + " " + user.family_name + "!");
		//response.write("OID: " + user.oid);
		if (tokenCache[user.oid]) {
			//response.write("Access Token: " + tokenCache[user.oid].accessToken);	
			response.writeHead(302, {"Location": "pickedItem.html"});
		}
	} else {
		var fullUrl = request.protocol + '://' + request.get('host') + '/catchcode';
		response.writeHead(302, {"Location": fullUrl});
	}
	response.end();
});

app.get('/catchcode', function(request, response) {
	//var fullUrl = request.protocol + '://' + request.get('host') + request.path;
	var fullUrl = 'https://' + request.get('host') + request.path;
	if (!request.query.code) {
		response.writeHead(302, {"Location": "https://" + login_host + "/common/oauth2/authorize?client_id=" + client_id + "&response_type=code&redirect_uri=" + fullUrl});
		response.end();
	} else {
		getAccessToken.getTokenResponseWithCode("https://" + graph_host + "/", client_id, client_secret, request.query.code, fullUrl, function(error, tokenResponseData) {
			var idToken = decodejwt.decodeJwt(tokenResponseData.id_token).payload;
			tokenCache[idToken.oid] = { 
				accessToken: tokenResponseData.access_token,
				refreshToken: tokenResponseData.refresh_token,
				idToken: idToken 
			}
			response.cookie('currentUser', idToken, { maxAge: 900000, httpOnly: true });
			response.writeHead(302, {"Location": request.protocol + '://' + request.get('host') + '/'});
			response.end();
			//response.end("Got an id token! " + JSON.stringify(idToken, null, 2));			
		});
	}
});

app.listen(port);