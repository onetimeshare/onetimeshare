var request = require('request');

var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const passport = require('passport')

var data

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
	console.log('inside timeout')
	var strbody = JSON.stringify({
			"comment": req.session.data.comment,
			"content": {
				"title": req.session.data.title,
				"description": req.session.data.message,
				"submitted-url": req.session.data.url,  
				"submitted-image-url": req.session.data.includeImage
			},
			"visibility": {
				"code": "anyone"
			}  
		});
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
	console.log('after timeout')
}));
