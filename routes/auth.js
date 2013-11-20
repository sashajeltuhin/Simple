var Auth
    , passport =        require('passport')
    , LocalStrategy =   require('passport-local').Strategy
    , profile = require('./profile')
    , sha = require("sha512crypt.js"),
      salt = "meyekid"
//    , TwitterStrategy = require('passport-twitter').Strategy
//    , FacebookStrategy = require('passport-facebook').Strategy
//    , GoogleStrategy = require('passport-google').Strategy
//    , LinkedInStrategy = require('passport-linkedin').Strategy



module.exports = {
    login: function(req, res, next) {
        passport.authenticate('local', function(err, user) {

            if(err)     { return next(err); }
            if(!user)   { return res.send(400); }


            req.logIn(user, function(err) {
                if(err) {
                    return next(err);
                }

                if(req.body.rememberme) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
                res.json(200, { "role": user.role, "username": user.username });
            });
        })(req, res, next);
    },

    logout: function(req, res) {
        req.logout();
        res.send(200);
    },
    please: function(req, res){

    },
    createPass: function (req, res){
        var filter = {_id:req.body._id};
        var p = sha._sha512crypt_intermediate(req.body.p, salt);
        var pr = {_id: filter._id, pass:p};
        profile.upsertProfile(filter, pr, function(){

        });
    },
    validate: function(user) {
//        check(user.username, 'Username must be 1-20 characters long').len(1, 20);
//        check(user.password, 'Password must be 5-60 characters long').len(5, 60);
//        check(user.username, 'Invalid username').not(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/);
//
//        // TODO: Seems node-validator's isIn function doesn't handle Number arrays very well...
//        // Till this is rectified Number arrays must be converted to string arrays
//        // https://github.com/chriso/node-validator/issues/185
//        var stringArr = _.map(_.values(userRoles), function(val) { return val.toString() });
//        check(user.role, 'Invalid user role given').isIn(stringArr);
    },

    localStrategy: new LocalStrategy(
        function(username, password, done) {

            var filter = {nickname:username};
            profile.loadUser(filter, function(err, u){
                if(u == null){

                }
                else if (err == null){

                }
                else{
                    var t = sha._sha512crypt_intermediate(u.pass, salt);
                    if (t != password){

                    }
                    else{
                        done(null, u);
                    }
                }
            });

//            var user = module.exports.findByUsername(username);
//
//            if(!user) {
//                done(null, false, { message: 'Incorrect username.' });
//            }
//            else if(user.password != password) {
//                done(null, false, { message: 'Incorrect username.' });
//            }
//            else {
//                return done(null, user);
//            }

        }
    ),

//    twitterStrategy: function() {
//        if(!process.env.TWITTER_CONSUMER_KEY)    throw new Error('A Twitter Consumer Key is required if you want to enable login via Twitter.');
//        if(!process.env.TWITTER_CONSUMER_SECRET) throw new Error('A Twitter Consumer Secret is required if you want to enable login via Twitter.');
//
//        return new TwitterStrategy({
//                consumerKey: process.env.TWITTER_CONSUMER_KEY,
//                consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
//                callbackURL: process.env.TWITTER_CALLBACK_URL || 'http://localhost:8000/auth/twitter/callback'
//            },
//            function(token, tokenSecret, profile, done) {
//                var user = module.exports.findOrCreateOauthUser(profile.provider, profile.id);
//                done(null, user);
//            });
//    },
//
//    facebookStrategy: function() {
//        if(!process.env.FACEBOOK_APP_ID)     throw new Error('A Facebook App ID is required if you want to enable login via Facebook.');
//        if(!process.env.FACEBOOK_APP_SECRET) throw new Error('A Facebook App Secret is required if you want to enable login via Facebook.');
//
//        return new FacebookStrategy({
//                clientID: process.env.FACEBOOK_APP_ID,
//                clientSecret: process.env.FACEBOOK_APP_SECRET,
//                callbackURL: process.env.FACEBOOK_CALLBACK_URL || "http://localhost:8000/auth/facebook/callback"
//            },
//            function(accessToken, refreshToken, profile, done) {
//                var user = module.exports.findOrCreateOauthUser(profile.provider, profile.id);
//                done(null, user);
//            });
//    },
//
//    googleStrategy: function() {
//
//        return new GoogleStrategy({
//                returnURL: process.env.GOOGLE_RETURN_URL || "http://localhost:8000/auth/google/return",
//                realm: process.env.GOOGLE_REALM || "http://localhost:8000/"
//            },
//            function(identifier, profile, done) {
//                var user = module.exports.findOrCreateOauthUser('google', identifier);
//                done(null, user);
//            });
//    },
//
//    linkedInStrategy: function() {
//        if(!process.env.LINKED_IN_KEY)     throw new Error('A LinkedIn App Key is required if you want to enable login via LinkedIn.');
//        if(!process.env.LINKED_IN_SECRET) throw new Error('A LinkedIn App Secret is required if you want to enable login via LinkedIn.');
//
//        return new LinkedInStrategy({
//                consumerKey: process.env.LINKED_IN_KEY,
//                consumerSecret: process.env.LINKED_IN_SECRET,
//                callbackURL: process.env.LINKED_IN_CALLBACK_URL || "http://localhost:8000/auth/linkedin/callback"
//            },
//            function(token, tokenSecret, profile, done) {
//                var user = module.exports.findOrCreateOauthUser('linkedin', profile.id);
//                done(null,user);
//            }
//        );
//    },
    serializeUser: function(user, done) {
        done(null, user.id);
    },

    deserializeUser: function(id, done) {
//        var user = module.exports.findById(id);
//
//        if(user)    { done(null, user); }
//        else        { done(null, false); }
    }
};