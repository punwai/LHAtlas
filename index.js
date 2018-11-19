var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
const PORT = process.env.PORT || 3000;
const LocalStrategy = require('passport-local').Strategy;
var sess  = require('express-session');
var passport = require('passport')
var flash = require('connect-flash');
var hbs = require('hbs');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('./config');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;


hbs.registerPartials(__dirname + '/views/partials');
app.use(express.static(path.join(__dirname, 'css')));

const bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

var db = require('./db')


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.set('Secret', config.secret);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


var apiroute = express.Router();

passport.use('login', new LocalStrategy(
  function(username, password, done) {
    db.query("select * from User where username = ?", [username], function(err, rows){
      if(err){
        return done(null, false, {message: "Error"});
      }
      if(!rows.length){ return done(null, false, {message: "User does not exist"})}
      else{
        var dbPassword  = rows[0].password;
        if(dbPassword == password){
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

    var values = [
      [username, password]
    ]
    db.query("select * from User where username = ?", [username], function(err, rows){
      if(!rows.length){
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

app.get('/login', function(req, res){
  res.render('login');
});



var get_cookies = function(request) {
  var cookies = {};
  request.headers && request.headers.cookie.split(';').forEach(function(cookie) {
    var parts = cookie.match(/(.*?)=(.*)$/)
    cookies[ parts[1].trim() ] = (parts[2] || '').trim();
  });
  return cookies;
};

var cookieExtractor = function(req) {
  var token = null;
  token =  get_cookies(req)['authtoken'];
  console.log(token);
  return token;
};

passport.use('jwtadmin', new JWTstrategy({
  secretOrKey: app.get("Secret"),
  jwtFromRequest : cookieExtractor
}, async (token, done) => {
  try {
      return done(null, token.user);
    
  } catch (error) {
    done(error);
  }
}));

apiroute.post('/atlas', (req,res) => {
  var sql = "INSERT INTO atlas (name, description, location, latitude, longitude) VALUES ?";
  var values = [
    [req.body.name, req.body.description, req.body.location, req.body.latitude, req.body.longitude]
  ]
  db.query(sql, [values], function(err,data){
    if (err) throw err;
    res.redirect('/api/admin');
    console.log("Number of records inserted: " + data.affectedRows);
  });
});

apiroute.get('/atlas', (req,res) => {
  db.query('SELECT * FROM atlas ', function (err, rows, fields) {
    var objs=[];
    console.log(rows.length);
    for(var i = 0; i <rows.length; i++){
      objs.push({id: rows[i].ID ,name: rows[i].name, description: rows[i].description, location: rows[i].location, latitude: rows[i].latitude, longitude: rows[i].longitude});
    }
    res.end(JSON.stringify(objs));
  })
})

app.get('/admin', function(req, res) {
  res.redirect('/api/admin');
});

apiroute.get('/atlas/:id', (req,res) => {
  var id = req.params.id;
  db.query('SELECT * FROM atlas WHERE ID = ' + id, function (err, rows, fields) {
    var objs=[];
    if(!rows.length){
      objs.push({status: "not found"});
    }
    for(var i = 0; i <rows.length; i++){
      objs.push({id: rows[i].ID ,name: rows[i].name, description: rows[i].description, location: rows[i].location, latitude: rows[i].latitude, longitude: rows[i].longitude});
    }
    res.end(JSON.stringify(objs));
  })
})



apiroute.get('/admin', function(req,res){
  res.render('admindash')
})

app.use('/api', passport.authenticate('jwtadmin', { session : false }), apiroute);


app.post('/login', async (req, res, next) => {
  passport.authenticate('login', async (err, user, info) => {     
    try {
      if(err || !user){
        return res.json({status: "failed"});
      }
      req.login(user, { session : false }, async (error) => {
        if( error ) return next(error)
        const body = { _id : user._id};
        const token = jwt.sign({ user : body },app.get('Secret'));
        res.cookie('id_token' ,token, {expires: new Date(Date.now() + 900000), httpOnly: true, secure: true });
        res.redirect('/api/admin');
      });     
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});


const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyAOx_n34yHgoKGkP7bcfpCRf6Ojm_f1lOU'
});



//Routing

// passport.serializeUser(function(user, cb) {
//   cb(null, user.id);
// });


// passport.deserializeUser(function(id, cb) {
//   db.query("select * from user where id = "+ id, function (err, rows){

//       cb(err, rows[0]);

//   });
// });

app.get('/', function(req, res){
    res.render('index');
});

app.get('/signup', function(req, res){
  res.render('registration');
})

app.post('/signup', passport.authenticate('register', { session : false,    failureRedirect : '/signup',
}) , function (req, res){
  res.json({ 
    message : 'Signup successful',
    user : req.user
  });
});


app.get('/getlocations', (req,res) => {
  db.query('SELECT * FROM atlas ', function (err, rows, fields) {
    var objs=[];
    console.log(rows.length);
    for(var i = 0; i <rows.length; i++){
      objs.push({name: rows[i].name, description: rows[i].description, location: rows[i].location, latitude: rows[i].latitude, longitude: rows[i].longitude});
    }
    res.end(JSON.stringify(objs));
  })
})

http.listen(PORT, function(){
  console.log('listening on *:3000');
});
