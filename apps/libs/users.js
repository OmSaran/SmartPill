var mysql      = require('mysql');
var _ = require('underscore');
var config = require('./config.json')
var connection = mysql.createConnection({
  host     : config.mysql.host,
  user     : config.mysql.user,
  password : config.mysql.password,
  database : config.mysql.database
});

var User = {};

User.isOwner = function(userId, pillBottleId, callback) {
    var qry = "SELECT * FROM users, userpill WHERE users.id = ? AND users.typeId = 1 AND userpill.userId = ? AND userpill.pillBottleId = ?";
    connection.query(qry, [userId, userId, pillBottleId], function(error, results, fields) {
        if(error) {
            return callback(error, null);
        }
        if(_.isEmpty(results))
            return callback(null, false);
        callback(null, true);
    })
}

User.findById = function(obj, callback) {
    var qry = 'SELECT * FROM Users WHERE id = ?';
    connection.query(qry, [obj.id], function(error, results, fields) {
        if(error) {
            return callback('DB Error', null);
        }
        if(!results)
            return callback(null, null);
        return callback(null, results[0]);
    })
}

User.register = function(name, username, password, typeId, callback) {
    var qry = "INSERT INTO Users SET ? ";
    connection.query(qry, { name: name, username: username, password: password, typeId: typeId }, function(error, results, fields) {
        if(error) {
            return callback(error.code, null);
        }
        callback(null, {id: results.insertId});
    })
}

User.addDevice = function(userId, platform, deviceId, callback) {
    var qry = "INSERT INTO UserDevice SET ? ";
    connection.query(qry, { userId: userId, platform: platform, deviceId: deviceId }, function(error, results, fields) {
        if(error) {
            console.log(error);
            if(error.code == 'ER_DUP_ENTRY')
                return callback(error, null);
            return callback('DB Error', null);
        }
        callback(null, results);
    })
}

User.findByUsername = function(obj, callback) {
    var qry = 'SELECT * FROM Users WHERE username = ?';
    connection.query(qry, [obj.username], function(error, results, fields) {
        if(error) {
            return callback('DB error', null);
        }
        if(results.length == 0)
            return callback(null, null);
        var user = results[0];
        var obj = {
            validPassword: function(pass) {
                if(user.password == pass)
                    return true;
                return false;
            },
            username: user.username,
            id: user.id
        }
        callback(null, obj);
    });
}

module.exports = User