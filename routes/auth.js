var Auth
    , passport =        require('passport')
    , LocalStrategy =   require('passport-local').Strategy
    , person = require('./user')
    , session = require('./adminsession')
    , sha = require("sha512crypt.js"),
      salt = "meyekid"
//    , TwitterStrategy = require('passport-twitter').Strategy
//    , FacebookStrategy = require('passport-facebook').Strategy
//    , GoogleStrategy = require('passport-google').Strategy
//    , LinkedInStrategy = require('passport-linkedin').Strategy



module.exports = {
    login: function(req, res, next) {
        passport.authenticate('local', function(err, user, msg) {

            if(err)     { return next(err); }
            if(!user)   { return res.send(400, {"err": msg}); }


            req.logIn(user, function(err) {
                if(err) {
                    return next(err);
                }

                if(req.body.rememberme){
                    req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
                    res.json(200, user.session );
                } else{
                    session.getTimeOut(user.session, function(time){
                        var now = new Date();
                        var milInHour = 60 * 60 * 1000;
                        req.session.cookie.maxAge = time * milInHour;
                        res.json(200, user.session );
                    });
                }

            });
        })(req, res, next);
    },

    logout: function(req, res) {
        req.logout();
        res.send(200);
    },
    please: function(req, res){

    },
    checkSession: function(req, res){
        var f = req.body;
        if (f == undefined || f.length <= 0){
            res.send(400, {"err": "Invalid session"});
        }
        session.loadSessionbyID(f, function(err, data){
           if (err !== null){
               res.send(400, {"err": msg});
           }
            else if (data.length > 0){
               var s = data[0];
               session.getTimeOut(s, function(time){
                   var now = new Date();
                   var milInHour = 60 * 60 * 1000;
                   var diff = Math.abs(now.getTime() - s.time.getTime())/milInHour;
                   if (diff > 0 && diff < time){
                       res.send(s);
                   }
                   else{
                       res.send({});
                   }
               })
           }
            else{
               res.send({});
           }
        });
    },
    applyRowFilter: function(req, res, userFilter, secFilter){
        if (req.user == undefined){
            res.send(400, {"err": 'Unauthorized to access data'});
        }
        else{
            for(var key in secFilter){
                var fieldValue = req.user[secFilter[key]]; //assumed to be an array
                if (userFilter[key] !== undefined && fieldValue.length > 0){
                    var userValue = userFilter[key].val !== undefined? userFilter[key].val : userFilter[key];
                    var allowed = [];
                        if (Array.isArray(userValue)){
                            if (userFilter[key].oper !== undefined && userFilter[key].oper == "<>"){//remove excluded from the allowed list
                                for(var i = 0; i < fieldValue.length; i++){
                                    if (userValue.indexOf(fieldValue[i]) < 0){
                                        allowed.push(fieldValue[i]);
                                    }
                                }
                            }
                            else{
                                for(var i = 0 ; i < userValue.length; i++){
                                    if (fieldValue.indexOf(userValue[i]) >= 0){
                                        allowed.push(userValue[i]);
                                    }
                                }
                            }
                            userFilter[key] = allowed;
                        }
                        else if (fieldValue.indexOf(userValue) < 0){ //single value
                            userFilter[key] = fieldValue;
                        }
                        else if (fieldValue.indexOf(userFilter[key]) >= 0 && userFilter[key].oper == "<>"){
                            for(var i = 0; i < fieldValue.length; i++){
                                if (userValue!== fieldValue[i]){
                                    allowed.push(fieldValue[i]);
                                }
                            }
                            userFilter[key] = allowed;
                        }

                }else if(userFilter[key] == undefined && fieldValue.length > 0) {
                    userFilter[key] = fieldValue;
                }
            }
        }
    },
    createPass: function (rawPass){
        var p = sha._sha512crypt_intermediate(rawPass, salt);
        return p;
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

            var filter = {uname:username};
            person.loadUser(filter, function(err, u){
                if(u == null){
                    done(null, false, "Username is invalid. Are you hacking?");
                }
                else{
                    var t = sha._sha512crypt_intermediate(password, salt);
                    if (t !== u.upass){
                        done(null, false, "Password does not match");
                    }
                    else{
                        session.newSession(u, function(err, s){
                            if(err !== null){
                                done(null, false, "Session cannot be started");
                            }
                            else{
                                u.session = s;
                                done(null, u);
                            }
                        })

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
        done(null, user._id);
    },

    deserializeUser: function(id, done) {
        var filter = {_id:id};
        person.loadUser(filter, function(err, u){
        if(u)    { done(null, u); }
        else        { done(null, false); }
        });
    }
};