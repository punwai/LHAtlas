var mysql = require('mysql');
require('dotenv').config()

var pool = mysql.createPool({
  supportBigNumbers: true,
  bigNumberStrings: true,
  port: 3306,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

var getConnection = function(callback) {
  pool.getConnection(function(err, connection) {
      callback(err, connection);
  });
};

  
module.exports = pool;