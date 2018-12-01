var passport = require('passport')
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


module.exports = function (app) {
  const LocalStrategy = require('passport-local').Strategy;
  const JWTstrategy = require('passport-jwt').Strategy;

  app.set('Secret', process.env.jwtSecret);
  app.use(cookieParser('keyboard cat'));
  app.use(session({ cookie: { maxAge: 60000 } }));
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  var salt = bcrypt.genSaltSync(10);



  passport.use('login', new LocalStrategy(
    function (username, password, done) {
      username = username.trim();
      password = password.trim();
      console.log(password);

      User.findOne({
        where: {
          name: username
        }
      }).then(
        (user) => {
          if (!user) {
            return done(null, false, { message: "User does not exist" });
          } else {
            if (bcrypt.compareSync(password, user.password)) {
              console.log('success');
              return done(null, user.get(), { message: "Logged In" });
            } else {
              return done(null, false, { message: "Please check your password" });
            }
          }
        }
      )
    }
  ));

  passport.use('register', new LocalStrategy(
    function (username, password, done) {
      var hashpass = bcrypt.hashSync(password, salt);
      username = username.trim();
      password = password.trim();
      User.findOne({
        where: {
          name: username
        }
      }).then(curr => {
        if (curr) {
          console.log("inhere!");
          return done(null, false, { message: "User Already Exists" });
        } else {
          User.create({
            name: username,
            password: hashpass,
            admin: false
          }).then((createdUser) => {
            return done(null, createdUser.get(), {message: "successfully created user"})
          })
        }
      })

    }
  ));


  passport.serializeUser(function (user, done) {
    if (user) {
      console.log('in');
      done(null, user.id);
    }
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id).then(function (user) {

      if (user) {

        done(null, user.get());

      } else {
        console.log('error')
      }
    });

  });

  var cookieExtractor = function (req) {
    var token = null;
    token = req.cookies.access_token;
    return token;
  };

  passport.use('jwtadmin', new JWTstrategy({
    secretOrKey: app.get("Secret"),
    jwtFromRequest: cookieExtractor
  }, async (token, done) => {
    try {
      if (token.user._id) {
        done(null, token, { message: 'authorised' })
      } else {
        done(null, false)
      }
    } catch (error) {
      done(error);
    }
  }));
  return passport;
};``