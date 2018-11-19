var LocalStrategy = require('passport-local').Strategy;
var db = require('./db')

module.exports = function( passport){
  passport.use('local-login', new LocalStrategy(  
    function(username,password,done){ 
      db.connect();     
      return done(null, rows[0]);

      connection.query("select * from tbl_users where username = ?", [username], function(err, rows){
        return done(null, rows[0]);
      });
  
    }

  
  
  ));
  return passport;
}
