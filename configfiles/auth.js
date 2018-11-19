var passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
require('dotenv').config()
var config = require('./config');
const bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
  
module.exports = function(db, app){
    app.set('Secret', process.env.jwtSecret);
    app.use(cookieParser('keyboard cat'));
    app.use(session({ cookie: { maxAge: 60000 }}));
    app.use(flash());
    var salt = bcrypt.genSaltSync(10);
  
    passport.use('login', new LocalStrategy(
        function(username, password, done) {
          username.trim();
          password.trim();
          db.query("select * from User where username = ?", [username], function(err, rows){
            if(err){
              return done(null, false, {message: "Error"});
            }
            if(!rows.length){ 
              return done(null, false, {message: "User does not exist"})}
            else{
              var dbPassword  = rows[0].password;
              if(bcrypt.compareSync(password, dbPassword)){
                const payload = {
                  check: true
                };
                var token = jwt.sign(payload, app.get('Secret'), {
                  expiresIn: 1440
                });
                return done(null, rows[0], {message: "Logged In"});
              }else{
                return done(null, false, {message: "Please check your password"});
              }
            }
          });
        }
      ));
      
      passport.use('register', new LocalStrategy(
        function(username, password, done) {
            db.query("select * from User where username = ?", [username], function(err, rows){
              if(!rows.length){
                var hashpass = bcrypt.hashSync(password, salt);
                var values = [
                  [username, hashpass]
                ]
              sql = "INSERT INTO User (username, password) VALUES ?";
              db.query(sql, [values], function(err, rows){
                if (err) done(error);
                return done(null, username);
              });
              }
              else{
                return done(null, false, {message: "username taken"});
              }
            });
         
        }
      ));
            
      
      var get_cookies = function(request) {
        var cookies = {};
      
        if(request.headers.cookie){request.headers && request.headers.cookie.split(';').forEach(function(cookie) {
          var parts = cookie.match(/(.*?)=(.*)$/)
          cookies[ parts[1].trim() ] = (parts[2] || '').trim();
        });
        }
        return cookies;
      };
      
      var cookieExtractor = function(req) {
        var token = null;
        token =  req.cookies.authtoken;  
        return token;
      };
      
      passport.use('jwtadmin', new JWTstrategy({
        secretOrKey: app.get("Secret"),
        jwtFromRequest : cookieExtractor
      }, async (token, done) => {
        try {
          console.log(token.user._id);
          db.query("select * from User where id = " + token.user._id, function(err,rows){
            if(rows){
              if(rows[0].admin){
                return done(null, token.user);
              }else{
                done(null, false);
              }
            }else{
              done(null, false);
            }
          })
        } catch (error) {
          done(error);
        }
      }));
    return passport;
};