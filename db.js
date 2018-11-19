var mysql = require('mysql');

var db = mysql.createConnection({
    supportBigNumbers: true,
    bigNumberStrings: true,
    port: 3306,
    host: "localhost",
    user: "root",
    password: "drag135",
    database: "atlasdb"
  });

db.connect();

module.exports = db;