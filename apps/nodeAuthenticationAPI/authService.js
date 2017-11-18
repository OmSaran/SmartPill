// requires
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var passportJWT = require("passport-jwt");
var LocalStrategy = require('passport-local').Strategy;
var gcm = require('node-gcm');
var _ = require('underscore');
var elasticsearch = require('elasticsearch');

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
var client = new elasticsearch.Client({
    host: config.elasticsearch.host,
    httpAuth: config.elasticsearch.username + ':' + config.elasticsearch.password,
    apiVersion: '6.0',
    // log: 'trace'
});

client.search({
    index: 'dosage',
    type: 'consumeEvent',
    body: {
        "query": {
            "match_all": {}
        }
    }
}).then(function (resp) {
    var hits = resp.hits.hits[0];
    console.log(hits);
})

// middlewares
app.use(bodyParser());
app.use(passport.initialize());
app.use(express.static('./apps/views'));

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

// Middleware to authorize modification of dosage.
var verifyAccess = function(req, res, next) {
    pillbottle.verifyModAccess(req.user.id, req.params.id, function(error, results) {
        if(error) {
            return res.sendStatus(500);
        }
        if(results.length == 0) {
            return res.send(401);
        }
        next();
    })
}
// Middleware to authorize pill consumption
var verifyConsumption = function(req, res, next) {
    pillbottle.verifyConsumption(req.user.id, req.params.id, function(error, results) {
        if(error) {
            return res.sendStatus(500);
        }
        if(_.isEmpty(results)) {
            return res.send(401);
        }
        next();
    })
}

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

/**
 * @api {get} /api/pillbottle Pillbottle Details
 * @apiName Pillbottle
 * @apiDescription To get pillbottle json array associated with user
 * @apiGroup Pillbottle
 * 
 * @apiHeader Authorization Bearer Access Token
 * @apiHeaderExample Request-Header: 
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0Ij0xNTA4Njc1OTc1fQ.96NXj1C8wxkfy5f_vjDrDH1Pl4GzUB299ikwlWYinNg
 * 
 * @apiSuccess {Number} id id of the pill bottle
 * @apiSuccess {String} pill pill name
 * @apiSuccess {Number} course Course ID
 * @apiSuccess {JSON} dosage Dosage details
 * @apiSuccess {String} time Dosage timestamp
 * 
 * @apiSuccessExample {json} Success-Example: 
 * [
 *   {
 *      "id": 2,
 *      "pill": "Montek"
 *      "course": 4,
 *      "description": "Cold, Cough",
 *      "dosage": [
 *          {
 *              "time": "06:00:00"
 *          },
 *          {
 *              "time": "15:00:00"
 *          }
 *      ]
 *   }
 * ]
 * 
 * @apiError (Error 401) Unauthorized Bad Access Token / Bad Doctor Username
 * @apiError (Error 500) InternalError Database Error
 */
app.get('/api/pillbottle', passport.authenticate('jwt', { session: false }), function(req, res) {
    // res.send(404, 'api not found');
    pillbottle.getAllByUserId(req.user.id, function(error, results) {
        if(error)
            return res.status(500).json({message: 'DB Error'});
        res.send(results);
    })
});

// Get details of a pillbottle
/**
 * @api {get} /api/pillbottle/:id Pillbottle Details
 * @apiName Pillbottle
 * @apiDescription To get pillbottle json of given id
 * @apiGroup Pillbottle
 * 
 * @apiHeader Authorization Bearer Access Token
 * @apiHeaderExample Request-Header: 
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0Ij0xNTA4Njc1OTc1fQ.96NXj1C8wxkfy5f_vjDrDH1Pl4GzUB299ikwlWYinNg
 * 
 * @apiSuccess {Number} id id of the pill bottle
 * @apiSuccess {String} pill pill name
 * @apiSuccess {Number} course Course ID
 * @apiSuccess {JSON} dosage Dosage details
 * @apiSuccess {String} time Dosage timestamp
 * 
 * @apiSuccessExample {json} Success-Example: 
 *   {
 *      "id": 2,
 *      "pill": "Montek"
 *      "course": 4,
 *      "description": "Cold, Cough",
 *      "dosage": [
 *          {
 *              "time": "06:00:00"
 *          },
 *          {
 *              "time": "15:00:00"
 *          }
 *      ]
 *   }
 * 
 * @apiError (Error 401) Unauthorized Bad Access Token / Bad Doctor Username
 * @apiError (Error 500) InternalError Database Error
 */
app.get('/api/pillbottle/:id', passport.authenticate('jwt', { session: false }), verifyConsumption, function(req, res) {
    pillbottle.getById(req.user.id, req.params.id, function(error, results) {
        if(error)
            return res.send('error');
        if(_.isEmpty(results))
            return res.sendStatus(204);
        res.send(results);
    })
});

// To add/modify a dosage to a pillbottle. Only doctors allowed to do this.
/**
 * @api {post} /api/dosage/pillbottle/:id Add new dosage
 * @apiName New dosage
 * @apiDescription To get pillbottle json of given id
 * @apiGroup Pillbottle
 * 
 * @apiHeader Authorization Bearer Access Token
 * @apiHeaderExample Request-Header: 
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0Ij0xNTA4Njc1OTc1fQ.96NXj1C8wxkfy5f_vjDrDH1Pl4GzUB299ikwlWYinNg
 * 
 * @apiSuccess {Number} id id of the pill bottle
 * @apiSuccess {String} pill pill name
 * @apiSuccess {Number} course Course ID
 * @apiSuccess {JSON} dosage Dosage details
 * @apiSuccess {String} time Dosage timestamp
 * 
 * @apiSuccessExample {json} Success-Example: 
 *   {
 *      "id": 2,
 *      "pill": "Montek"
 *      "course": 4,
 *      "description": "Cold, Cough",
 *      "dosage": [
 *          {
 *              "time": "06:00:00"
 *          },
 *          {
 *              "time": "15:00:00"
 *          }
 *      ]
 *   }
 * 
 * @apiError (Error 401) Unauthorized Bad Access Token / Bad Doctor Username
 * @apiError (Error 500) InternalError Database Error
 */
app.post('/api/dosage/pillbottle/:id', passport.authenticate('jwt', { session: false }), verifyAccess, function(req, res) {
    var pillBottleId = req.body.pillBottleId;
    var pill = req.body.pill;
    var description = req.body.description;
    var dosage = req.body.dosage;
    pillbottle.newDosage(pillBottleId, description, pill, dosage, function(error, results) {
        if(error) {
            return res.sendStatus(500);
        }        
        pillbottle.getPatientDevIds(pillBottleId, function(error, results) {
            if(error) {
                console.log(error);
                return res.send('Failed to fetch deviceIds');
            }

            if(_.isEmpty(results))
                return res.sendStatus(200);

            var androidRegTokens = results.android;
            var iosRegTokens = results.ios;
            var regTokens = results.all;

            var data = {
                pillBottleId: pillBottleId,
                pill: pill,
                dosage: dosage
            }

            var message = new gcm.message({
                priority: 'high',
                timeToLive: 86400,
                data: data,
                notification: {
                    title: "Dosage Changed",
                    body: "Open app to see changes"
                }
            });

            // sender.send(message, { registrationTokens: regTokens }, function (err, response) {
            //     if(err) {
            //         console.error(err);
            //         res.send('Failed to send notifications');
            //     }
            //     console.log(response);
            //     res.sendStatus(200);
            // });

            res.sendStatus(200);
        })
        
        console.log(results);
        return res.sendStatus(200);
    })
})


/**
 * @api {delete} /api/dosage/pillbottle/:id Delete dosage
 * @apiName Delete dosage
 * @apiDescription To remove existing dosage in pillbottle
 * @apiGroup Pillbottle
 * 
 * @apiHeader Authorization Bearer Access Token
 * @apiHeaderExample Request-Header: 
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0Ij0xNTA4Njc1OTc1fQ.96NXj1C8wxkfy5f_vjDrDH1Pl4GzUB299ikwlWYinNg
 * 
 * @apiSuccess {String} message ok
 * 
 * @apiError (Error 401) Unauthorized Bad Access Token / Bad Doctor Username
 * @apiError (Error 500) InternalError Database Error
 */
app.delete('/api/dosage/pillbottle/:id', passport.authenticate('jwt', { session: false }), verifyAccess, function(req, res) {
    var pillBottleId = req.params.id;
    pillbottle.removeDosage(pillBottleId, function(error, results) {
        if(error) {
            return res.sendStatus(500);
        }

        pillbottle.getPatientDevIds(pillBottleId, function(error, res) {
            if(error) {
                console.log(error);
                return res.send('Failed to fetch deviceIds');
            }

            if(_.isEmpty(res))
                return res.sendStatus(200);

            var androidRegTokens = res.android;
            var iosRegTokens = res.ios;
            var regTokens = res.all;

            var data = {
                pillBottleId: pillBottleId
            }

            var message = new gcm.message({
                priority: 'high',
                timeToLive: 86400,
                data: data,
                notification: {
                    title: "Dosage Removed",
                    body: "Open app to see changes"
                }
            });

            // sender.send(message, { registrationTokens: regTokens }, function (err, response) {
            //     if(err) {
            //         console.error(err);
            //         res.send('Failed to send notifications');
            //     }
            //     console.log(response);
            //     res.sendStatus(200);
            // });

            res.status(200).json({ message: "ok" });
        })
    })
})


/**
 * @api {get} /api/doc Doctor List
 * @apiName Doctor List
 * @apiDescription Get list of all doctors
 * @apiGroup Users
 * 
 * @apiHeader Authorization Bearer Access Token
 * @apiHeaderExample Request-Header: 
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0Ij0xNTA4Njc1OTc1fQ.96NXj1C8wxkfy5f_vjDrDH1Pl4GzUB299ikwlWYinNg
 * 
 * @apiSuccess {Number} id ID of the doctor
 * @apiSuccess {String} name Name of the doctor
 * @apiSuccess {String} username username of the doctor
 * @apiSuccessExample {json} Success-Example: 
 * [
 *    {
 *       "id": 2,
 *        "name": "Bala",
 *        "username": "bala"
 *    }
 * ]
 * @apiError (Error 401) Unauthorized Bad Access Token
 */
app.get('/api/doc', passport.authenticate('jwt', { session: false }), function(req, res) {
    User.getAllDoctors(function(error, results) {
        if(error)
            return res.send(500, { message: 'DB Error' });
        if(_.isEmpty(results))
            return res.status(200);
        res.send(200, results);
    })
})

/**
 * @api {get} /api/doc/patient Doctor's Patients
 * @apiName Doctor's Patients List
 * @apiDescription To get the list of doctor's all patients
 * @apiGroup Users
 * 
 * @apiHeader Authorization Bearer Access Token
 * @apiHeaderExample Request-Header: 
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0Ij0xNTA4Njc1OTc1fQ.96NXj1C8wxkfy5f_vjDrDH1Pl4GzUB299ikwlWYinNg
 * 
 * @apiSuccess (200) {Number} id ID of the patient
 * @apiSuccess (200) {String} name Name of the patient
 * @apiSuccess (200) {String} username username of the patient
 * @apiSuccessExample {json} Success-Example: 
 * [
 *    {
 *       "id": 2,
 *        "name": "Bala",
 *        "username": "bala"
 *    }
 * ]
 * 
 * @apiError (Error 500) Database Error
 * @apiSuccess (204) {String} Message No Content 
 */

app.get('/api/doc/patient', passport.authenticate('jwt', { session: false }), function(req, res) {
    User.findPatientsOfDoc({id: req.user.id}, function(error, results) {
        if(error) {
            res.send(500, { message: 'DB Error' });
        }
        if(_.isEmpty(results)) {
            return res.status(204).send();
        }
            
        res.send(200, results);
    })
})

/**
 * @api {post} /api/pill/:id EventPillConsumed
 * @apiName EventPillConsumed
 * @apiDescription To send the event of pill consumption
 * @apiGroup Events
 * 
 * @apiHeader Authorization Bearer Access Token
 * @apiHeaderExample Request-Header:
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0Ij0xNTA4Njc1OTc1fQ.96NXj1C8wxkfy5f_vjDrDH1Pl4GzUB299ikwlWYinNg
 * 
 * @apiSuccess (201) Created Successfully created event document in elasticsearch
 * 
 * @apiError (Error 500) InternalError Database Error
 */
app.post('/api/pill/:id', passport.authenticate('jwt', { session: false }), verifyConsumption, function(req, res) {
    var pillBottleId = req.params.id;
    var numberOfPills = req.body.numberOfPills;
    var timestamp = req.body.timestamp;
    pillbottle.getCourseDetails(pillBottleId, function(error, results){
        if(error) {
            return res.status(500).json({ message: 'DB Error' });
        }
        var courseId = results.courseId;
        var description = results.description;
        var pillName = results.pillName;
        var dosage = results.dosage;

        var document = {
            pillBottleId: pillBottleId,
            courseId: courseId,
            description: description,
            pillName: pillName,
            timestamp: timestamp,
            numberOfPills: numberOfPills,
            dosage: dosage
        }
        console.log(document);
        client.index({
            index: 'dosage',
            type: 'consumeEvent',
            body: document
        }, function(error, response) {
            if(error) {
                console.log(error);
                return res.status(500).json({ message: 'DB Error' });
            }
            if(response.result == 'created')
                return res.status(201).send( );
        });
    })
});

app.get('/api/doc/patient/:patientUsername', passport.authenticate('jwt', { session: false }), function(req, res) {
    pillbottle.getPatientDetailsByDoc(req.user.id, req.params.patientUsername, function(error, results) {
        if(error) {
            return res.status(500).json({ message: 'DB Error' });
        }
        if(_.isEmpty(results)) {
            return res.status(201).send();
        }

        res.send(results);
    })
})

var listener = app.listen(process.env.PORT || 3000, function() {
    console.log('Hosted on ' + listener.address().port);
})


var edb = {
    pillBottleId: 1,
    courseId: 2,
    description: 'blabla',
    pillName: 'monetk',
    timestamp: '',
    numberOfPills: 2
}