// requires
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var passportJWT = require("passport-jwt");
var LocalStrategy = require('passport-local').Strategy;
var gcm = require('node-gcm');

var config = require('../libs/config.json');
var User = require('../libs/users.js');
var pillbottle = require('../libs/pillbottle.js');

// Inits
var app = express();
var sender = new gcm.Sender(config.gcm.serverKey);
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = config.jwt.privateKey;

// middlewares
app.use(bodyParser());
app.use(passport.initialize());
app.use(express.static('../views'));

var jstrategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
    // usually this would be a database call:
    next(null, jwt_payload);
    // User.findById({id: jwt_payload.id}, function(err, user) {
    //     if(err) { return done(err); }
    //     if(!user) {
    //         return next(null, false);
    //     }
    //     return next(null, user);
    // });
});

passport.use(jstrategy);
passport.use(new LocalStrategy(
    {
        passReqToCallback: true
    },
    function(req, username, password, done) {
        User.findByUsername({ username: username }, function(err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));

// Sign up for both, the patient and the doctor. Type 1 = Patient, 2 = Doctor

/**
 * @api {post} /api/signup User Registration
 * @apiName Signup
 * @apiDescription Register the user (doctor/patient) to cloud
 * @apiGroup Authentication
 * 
 * @apiParamExample {json} Request-Example: 
 * {
 *   name: "Om",
 *   username: "omsaran"
 *   password: "password123"
 *   typeId: 1
 * }
 * 
 * @apiParam {String} name Name of the user
 * @apiParam {String} username Username of the user
 * @apiParam {String} password Password to login
 * @apiParam {Number} typeId 1 - Patient, 2 - Doctor
 * 
 * 
 * @apiSuccess {String} id ID of the registered user
 * @apiSuccessExample {json} Success-Example: 
 * {
 *   id: 1
 * }
 * @apiError (Error 400) {String} message Bad Request
 * @apiError (Error 409) {String} message Username Unavailable
 * @apiError (Error 500) {String} message Database Error
 */
app.post('/api/signup', function(req, res) {
    var name = req.body.name;
    var username = req.body.username;
    var password = req.body.password;
    var typeId = req.body.typeId;


    User.register(name, username, password, typeId, function(error, results) {
        if(error) {
            if(error == "ER_DUP_ENTRY"){
                return res.send(409, { message: "Username unavailable" });
            }
            if(error == "ER_NO_REFERENCED_ROW_2" || error == "ER_BAD_NULL_ERROR") {
                return res.send(400, { message: "Bad Request" });
            }
            return res.send(500, { message: "Database Error" });
        }
        res.send(results);
    })
})
/**
 * @api {post} /api/login User Login
 * @apiName Login
 * @apiDescription Login (doctor/patient) to cloud
 * @apiGroup Authentication
 * 
 * @apiParamExample {json} Request-Example: 
 * {   
 *   username: "omsaran"
 *   password: "password123" 
 * }
 * 
 * @apiParam {String} username Username of the user
 * @apiParam {String} password Password to login
 * 
 * 
 * @apiSuccess {String} token Access Token for logged in user
 * @apiSuccessExample {json} Success-Example: 
 * {
 *   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0Ij0xNTA4Njc1OTc1fQ.96NXj1C8wxkfy5f_vjDrDH1Pl4GzUB299ikwlWYinNg"
 * }
 * @apiError (Error 401) Unauthorized Bad Credentials
 */
app.post('/api/login', passport.authenticate('local', { session: false }), function(req, res) {
    var payload = { id: req.user.id };
    var token = jwt.sign(payload, jwtOptions.secretOrKey);
    res.json({
        token: token
    });
})
/**
 * @api {post} /api/device Mobile Device Registration
 * @apiName Mobile Registration
 * @apiDescription Register Mobile Device to cloud
 * @apiGroup Authentication
 * 
 * @apiHeader Authorization Bearer Access Token
 * @apiHeaderExample Request-Header: 
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0Ij0xNTA4Njc1OTc1fQ.96NXj1C8wxkfy5f_vjDrDH1Pl4GzUB299ikwlWYinNg
 * 
 * @apiParamExample {json} Request-Example: 
 * {   
 *   platform: 1
 *   deviceId: "qWezFGMMF" 
 * }
 * 
 * @apiParam {String} platform 1 - Android, 2 - iOS
 * @apiParam {String} deviceId Unique Device ID for FCM
 * 
 * 
 * @apiSuccess {String} message ok
 * 
 * @apiError (Error 401) Unauthorized Bad Access Token
 * @apiError (Error 400) ClientError Device already registered
 * @apiError (Error 500) InternalError Database Error
 */
app.post('/api/device', passport.authenticate('jwt', {session: false}), function(req, res) {
    var userId = req.user.id;
    var platform = req.body.platform;
    var deviceId = req.body.deviceId;

    User.addDevice(userId, platform, deviceId, function(error, results) {
        if(error) {
            if(error.code == 'ER_DUP_ENTRY')
                return res.status(400).json({ message: 'Device already registered' });
            return res.send(500, {message: "DB Error"});
        }
        res.send({message: "Ok"});
    })
})



/**
 * @api {post} /api/pillbottle Pillbottle Registration
 * @apiName Pillbottle Registration
 * @apiDescription Register Pillbottle to the cloud to obtain unique ID
 * @apiGroup Authentication
 * 
 * @apiHeader Authorization Bearer Access Token
 * @apiHeaderExample Request-Header: 
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0Ij0xNTA4Njc1OTc1fQ.96NXj1C8wxkfy5f_vjDrDH1Pl4GzUB299ikwlWYinNg
 * 
 * @apiSuccess {Number} id Unique ID for the pill bottle
 * @apiSuccessExample {json} Success-Example: 
 * {
 *   id: 1
 * }
 * @apiError (Error 401) Unauthorized Bad Access Token
 * @apiError (Error 500) InternalError Database Error
 */
app.post('/api/pillbottle', passport.authenticate('jwt', { session: false }), function(req, res) {
    pillbottle.add(req.user.id, function(error, results) {
        if(error) {
            return res.status(500).json({ message: "DB Error" });
        }
        res.status(200).json(results);
    });
})


/**
 * @api {post} /api/pillbottle/doc Authorize Doctor
 * @apiName Doctor Authorization
 * @apiDescription Used by patient to Authorize doctor to access pill bottle.
 * @apiGroup Authentication
 * 
 * @apiHeader Authorization Bearer Access Token
 * @apiHeaderExample Request-Header: 
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0Ij0xNTA4Njc1OTc1fQ.96NXj1C8wxkfy5f_vjDrDH1Pl4GzUB299ikwlWYinNg
 * 
 * @apiParam {Number} pillBottleId Unique ID of the pill bottle to be authorized
 * @apiParam {String} doctorUsername Username of the doctor to authorize
 * 
 * @apiParamExample {json} Request-Example: 
 * {
 *   pillBottleId: 5,
 *   doctorUsername: "balathedoctor"
 * }
 * 
 * @apiSuccess {String} message ok
 * 
 * @apiError (Error 401) Unauthorized Bad Access Token / Bad Doctor Username
 * @apiError (Error 400) ClientError Redundant Registration
 * @apiError (Error 500) InternalError Database Error
 */
app.post('/api/pillbottle/doc', passport.authenticate('jwt', { session: false }), function(req, res) {
    User.isOwner(req.user.id, req.body.pillBottleId, function(error, results) {
        if(error) {
            console.log(error);
            return res.status(500).json({ message: 'DB Error' });
        }
        if(results)
        {   
            pillbottle.addDoctor(req.body.doctorUsername, req.body.pillBottleId, function(error, results) {
                if(error) {
                    return res.status(error.status).json({message: error.message});
                }
                res.status(200).json({message: "ok"})
                // .json(results);
            });
        }
        else 
        {
            res.status(401).send();
        }
    })
})

var listener = app.listen(process.env.PORT || 3000, function() {
    console.log('Hosted on ' + listener.address().port);
})
