var request = require('request');

var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const passport = require('passport')
var Linkedin = require('node-linkedin')('api', 'secret', 'callback');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


passport.use('linkedin',new LinkedInStrategy({
  clientID: process.env.CLIENTID,
  clientSecret: process.env.CLIENTSECRET,
  callbackURL: process.env.CALLBACKURL,
  passReqToCallback: true,
  state : true
}, function(req, accessToken, refreshToken, profile, done) {
	console.log("Auth completed for trans_id "+req.session.data.trans_id+" will start sharing.");

	var postjson = {
		"comment": req.session.data.message,
		"content": {
			"title": req.session.data.title,
			"description": req.session.data.description,
			"submitted-url": req.session.data.url,
			"submitted-image-url": req.session.data.includeImage
		},
		"visibility": {
			"code": "anyone"
		}  
	};

	var linkedin = Linkedin.init(accessToken);
    linkedin.people.share(postjson, function(err, data) {
		var redirect_url = req.session.data.redirect_url;
		if(err){
			console.log("ERROR: for trans_id ", req.session.data.trans_id, " with error as ", err);
			return done(err, redirect_url+ '?error='+err);
		}
		console.log("completed linkedin share for trans_id ", req.session.data.trans_id, " with data as ", data);
		return done(null, redirect_url +'?trans_id='+req.session.data.trans_id);
    });
	/*
	//REST API
	var strbody = JSON.stringify(postjson);
	console.log("Stringifies body will be ", strbody);
	request.post({
		headers: {'content-type' : 'application/json', 'x-li-format': 'json', 'Authorization' : 'Bearer '+accessToken },
		url:     'https://api.linkedin.com/v1/people/~/shares?format=json',
		body: strbody
	}, function(error, response, body){
		var redirect_url = req.session.data.redirect_url;
		if(error){
			console.log("ERROR: for trans_id ", req.session.data.trans_id, " with error as ", error, " and response as ", response);
			return done(error, redirect_url+ '?error='+error);
		}
			console.log("completed linkedin share for trans_id ", req.session.data.trans_id, " with body as ", body);
			return done(null, redirect_url +'?trans_id='+req.session.data.trans_id);
	});
	*/
}));
