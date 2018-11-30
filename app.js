var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
const PORT = process.env.PORT || 4000;
var hbs = require('hbs');
var jwt = require('jsonwebtoken');
require('dotenv').config()
const bodyParser = require('body-parser');
var flash = require('connect-flash');
var db = require('./config/db')
var passport = require('./config/auth')(db, app);
const TodoItem = require('./models');
const { check, validationResult } = require('express-validator/check');
const Atlas = require('./models').Atlas;
const Product = require('./models').Product;
const Version = require('./models').Version;


hbs.registerPartials(__dirname + '/views/partials');
app.use(express.static(path.join(__dirname, 'static')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('Issuer', process.env.issuer);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());  

var apiroute = require('./routes/api')(db, app);


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
        res.redirect('/login');
      }
      req.login(user, { session : false,
        failureFlash : true
      }, async (error) => {
        if( error ) return next(error)
        const body = { _id : user.id};
        const token = jwt.sign({ 
          user : body,        
        },app.get('Secret'),
        {
          expiresIn: 15*60,
          issuer: app.get('Issuer')
        }
        );
        res.cookie('access_token' ,token, {expires: new Date(Date.now() + 900000), httpOnly: true});
        res.redirect('/admin');
        // res.end(JSON.stringify({"access_token": token, "status": "success"}));
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


app.post('/signup', passport.authenticate('register', { session : false,    failureRedirect : '/signup',
}), function (req, res){
  res.redirect('/');
});



app.get('/getlocations', (req,res) => {
  Atlas.findAll({
    include: [{
        model: Version,
        as: "products",
        required: false,
        attributes: ['id', 'name'],
        through: { attributes: [] },
        include: [{
            model: Product,
            as: "product",
            required: false,
        }]
      }]        
  }).then(atlases => res.json(atlases));
})

app.get('/getproducts', (req, res) => {
  Product.findAll({
    include: [{
        model: Version,
        as: 'versions',
        required: false
    }]
  }).then(product =>
      res.json(product)
  );
})


module.exports = app;
