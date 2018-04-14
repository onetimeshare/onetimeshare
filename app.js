const express = require('express')
const path = require('path')
const app = express()
const passport = require('passport')
require('./strategy') 
const session = require('express-session')
app.use(session({secret : 'SECRET'}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, 'homepage.html'));
//  res.status(200).send('Welcome to OneTimeShare - the service that shares your update *just once* on social networks and forgets your credentials!');
});

app.get('/auth/linkedin',
  function(req, res, next){
  	var decodedQuery = {};
  	var keys = Object.keys(req.query);
  	for( var i =0 ; i < keys.length ; i++){
  		decodedQuery[keys[i]] = decodeURIComponent(req.query[keys[i]]);
  	}
  	console.log("Request came in with data as ", decodedQuery);
	req.session.data = decodedQuery;
	console.log("Starting auth flow for trans_id "+decodedQuery.trans_id);
	next()
  }
  ,
  passport.authenticate('linkedin', { scope: ['r_emailaddress','r_basicprofile','w_share'] }));

app.get('/auth/linkedin/callback', function(req, res, next) {
	passport.authenticate('linkedin', function(err, redirectto){
		console.log('callback of linkedin')
		return res.redirect(redirectto);
	})(req, res, next);
});

app.listen(process.env.PORT||8081)
