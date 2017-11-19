// require
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var passportJWT = require("passport-jwt");
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
//


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
app.get('/api/pillbottle/:id', passport.authenticate('jwt', { session: false }), function(req, res) {
    pillbottle.getById(req.user.id, req.params.id, function(error, results) {
        if(error)
            return res.send('error');
        if(results.length == 0)
            return res.sendStatus(204);
        res.send(results);
    })
});

// To add/modify a dosage to a pillbottle. Only doctors allowed to do this.

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

// To record consumption of pill
app.post('api/pill', passport.authenticate('jwt'), function(req, res) {
    var pillBottleId = req.body.pillBottleId;
    pillbottle.getById(req.user.id, pillBottleId, function(error, results) {

    })
});

app.listen(3001)