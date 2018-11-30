var passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
require('dotenv').config()
const bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
const User = require('../models').User;

const { check, validationResult } = require('express-validator/check');


module.exports = function(db, app){
    app.set('Secret', process.env.jwtSecret);
    app.use(cookieParser('keyboard cat'));
    app.use(session({ cookie: { maxAge: 60000 }}));
    app.use(flash());
    var salt = bcrypt.genSaltSync(10);
  
    passport.use('login',  new LocalStrategy(
        function(username, password, done) {
          username.trim();
          password.trim();

          User.findOne({
            where: {
              name: username
            }
          }).then(
            (user) => {
              if(!user){
                return done(null, false, {message: "User does not exist"});
              }else{
                if(bcrypt.compareSync(password, user.password)){
                  return done(null, user, {message: "Logged In"});
                }else{
                  return done(null, false, {message: "Please check your password"});
                }  
              }
            }
          )
        }
      ));
      
      passport.use('register', new LocalStrategy(
        function(username, password, done) {
          var hashpass = bcrypt.hashSync(password, salt);
          username.trim();
          password.trim();
          User.findOne({
            where: {
              name: username
            }
          }).then(curr => {
            if(curr){
              return done(null, false, {message: "User Already Exists"});
            }else{
              User.create({
                name: username,
               password: hashpass
                }).then(() => {
                  return done(null, username);
                })  
            }
          })
                 
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
        token =  req.cookies.access_token;  
        return token;
      };
      
      passport.use('jwtadmin', new JWTstrategy({
        secretOrKey: app.get("Secret"),
        // jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken()
        jwtFromRequest: cookieExtractor
      }, async (token, done) => {
        try {
          console.log(token.user._id);
          User.findOne({
            where: {
              id: token.user._id
            }
          }).then(results => {
            if(results){
              if(results.admin){
                done(null, results, {message: 'unauthorised'})
              }  else{
                done(null, false)
              }
            }else{
              done(null, false)
            }
          })
        } catch (error) {
          done(error);
        }
      }));
    return passport;
};