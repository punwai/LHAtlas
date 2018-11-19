var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
const PORT = process.env.PORT || 4000;
var hbs = require('hbs');
var jwt = require('jsonwebtoken');
require('dotenv').config()
var bcrypt = require('bcrypt');
var config = require('./configfiles/config');
const bodyParser = require('body-parser');
var flash = require('connect-flash');
var db = require('./configfiles/db')
const expressValidator = require('express-validator');
var passport = require('./configfiles/auth')(db, app);

hbs.registerPartials(__dirname + '/views/partials');
app.use(express.static(path.join(__dirname, 'staticfiles')));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());  
app.use(expressValidator());

var apiroute = require('./routers/api')(db, app);


var admin = express.Router();


admin.get('/',  function(req,res){
  res.render('admindash')
})

admin.get('/products', function(req,res){
  res.render('adminproduct')
})

app.use('/api', passport.authenticate('jwtadmin', { session : false }), apiroute);
app.use('/admin', passport.authenticate('jwtadmin', { session : false, failureRedirect: '/denied'}), admin);

app.get('/denied', function(req,res){
  res.render('denied');
});

app.get('/login', function(req, res){
  res.render('login', {message: req.session.message});
});



app.post('/login', async (req, res, next) => {
  passport.authenticate('login', (err, user, info) => {     
    try {
      if(err || !user){
        if(err){
          console.log(err);
        }
        req.session.message = info.message;
        res.end(JSON.stringify({"status": "failed"}));
      }
      req.login(user, { session : false,
        failureFlash : true
      }, async (error) => {
        if( error ) return next(error)
        const body = { _id : user.id};
        const token = jwt.sign({ user : body },app.get('Secret'));
        console.log(token);
        // res.cookie('authtoken' ,token, {expires: new Date(Date.now() + 900000), httpOnly: true});
        // res.redirect('/admin');
        res.end(JSON.stringify({"access_token": token, "status": "success"}));
      });     
    } catch (error) {
      return next(err);
    }
  })(req, res, next);
});


const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyAOx_n34yHgoKGkP7bcfpCRf6Ojm_f1lOU'
});


app.get('/', function(req, res){
    res.render('index');
});

app.get('/signup', function(req, res){
  res.render('registration');
})


function checkReg(req, res, next){
  req.body.username.trim();
  req.body.password.trim();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  //validate 
  var errors = req.validationErrors();
  if (errors) {
      res.render('registration',{user:null,frm_messages:errors});
  } else {
    next();
  }
}

app.post('/signup', [checkReg, passport.authenticate('register', { session : false,    failureRedirect : '/signup',
})], function (req, res){
  res.json({ 
    message : 'Signup successful',
    user : req.user
  });
});



app.get('/getlocations', (req,res) => {
  db.getConnection(function(err,connection){
    if (err) throw err;
    connection.query('SELECT * FROM atlas ', function (error, rows, fields) {
    if(rows=== undefined){
      res.send("DB Error")
    }else{
      var objs=[];
      var pending = rows.length;
      for(var i = 0; i <rows.length; i++){
        let products = [];
        let currentRow = rows[i];
        connection.query('SELECT P.product_id, version_name, product_name FROM versionatlas As VA INNER JOIN versions AS V on V.version_id = VA.version_id INNER JOIN products AS P on P.product_id = V.product_id where atlas_id = ?',[[currentRow.id]], function (error2, rows2, fields2) {
          console.log(currentRow);
          if(rows2 === undefined){
            console.log("can't access product database");
          }else{

            for(var j = 0; j <rows2.length; j++){
              products.push({id: rows2[j].product_id, name: rows2[j].product_name, version: rows2[j].version_name});
            }
            var currentJson = currentRow;
            currentJson["products"] = products;
            objs.push(currentJson);  
            if( 0 === --pending ){
              res.end(JSON.stringify(objs));
            }
          }
        });
      }
    }
    connection.release();
    if(error){
      res.send(error);
    }

    });
  });
})

app.get('/getproducts', (req, res) => {
  db.query("SELECT * FROM products",function(err,rows,fields){
    if(err) throw err;
    var objs= [];
    if(rows){
      res.end(JSON.stringify(rows));
    }else{
      res.end("DB Error");
    }
  });
})


http.listen(PORT, function(){
  console.log('listening on *:3000');
});
