var mysql      = require('mysql');
var _ = require('underscore');
var config = require('./config.json')

var db_config = {
    host     : config.mysql.host,
    user     : config.mysql.user,
    password : config.mysql.password,
    database : config.mysql.database
}
// var connection = mysql.createConnection({
//   host     : config.mysql.host,
//   user     : config.mysql.user,
//   password : config.mysql.password,
//   database : config.mysql.database
// });

var connection; 

function handleDisconnect() {
    connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                    // the old one cannot be reused.
  
    connection.connect(function(err) {              // The server is either down
      if(err) {                                     // or restarting (takes a while sometimes).
        console.log('error when connecting to db:', err);
        setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
      }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
       console.log('db error', err);
       if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
        handleDisconnect();                         // lost due to either server restart, or a
       } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
       }
    });
}
  
handleDisconnect();

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

User.getAllDoctors = function(callback) {
    var qry = 'SELECT id, name, username FROM Users WHERE typeId=2';
    connection.query(qry, function(error, results, fields) {
        if(error) {
            return callback('DB Error', null);
        }
        if(!results)
            return callback(null, null);
        return callback(null, results);
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