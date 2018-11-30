var express = require('express');
const Atlas = require('../models').Atlas;
const Product = require('../models').Product;
const Version = require('../models').Version;

const { check, validationResult } = require('express-validator/check');

module.exports = function(app){
    var apiroute = express.Router();
    var emptyString = function(req, res, next){
        console.log(req.body);
        for(let prop in req.body){
            if(req.body[prop] == ""){
                req.body[prop] = undefined
                console.log(prop)
            }
        }
        next();
    }

    apiroute.post('/atlas',[
        emptyString,
        check('name').trim().escape().isLength({min: 3, max: 255}),
        check('description').trim().escape().optional().isLength({max: 255}),
        check('location').trim().escape().optional().isLength({max: 255}),
        check('latitude').trim().escape().optional().isNumeric(),
        check('longitude').trim().escape().optional().isNumeric(),
        check('website').trim().escape().optional().isLength({max: 255}),
        check('email').trim().escape().optional().isLength({max: 255}).isEmail(),
        check('patients').trim().optional().isNumeric(),
    ], (req,res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).json({ error: message() });
        }
        var atlas_id;
        var sql = "INSERT INTO atlas (name, description, location, latitude, longitude, website, email, patients) VALUES ?";
        var values = [
          [req.body.name, req.body.description, req.body.location, req.body.latitude, req.body.longitude, req.body.website, req.body.email, req.body.patients]
        ]
        console.log(req.body);
            Atlas.create({
                name: req.body.name,
                description: req.body.description,
                location: req.body.location,
                latitude:  req.body.latitude, 
                longitude: req.body.longitude,
                website: req.body.website, 
                email: req.body.email, 
                patients: req.body.patients
            }).then((created) => {
                if(req.body.products){
                    if(Array.isArray(req.body.products)){
                        for(var i = 0; i < req.body.products.length; i++){
                            created.addProducts(req.body.products[i])
                        }
                    }else{
                        created.addProducts(req.body.products);
                    }
                }
                
            })
            .then(() => {res.redirect("/admin");})        
    });
    
    apiroute.get('/atlas', (req,res) => {
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
    });
    
    
    apiroute.get('/atlas/:id', (req,res) => {
        Atlas.find({
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
            }],
            where: {
                id: req.params.id
              }      
        }).then(atlases => res.json(atlases));
    });
    
    apiroute.delete('/atlas/:id', (req,res) => {
        Atlas.destroy({
            where: {
                id: req.params.id
            }
        });
    });
    
    apiroute.put('/atlas/:id', [
        emptyString,
        check('name').trim().escape().isLength({min: 3, max: 255}),
        check('description').trim().escape().optional().isLength({max: 255}),
        check('location').trim().escape().optional().isLength({max: 255}),
        check('latitude').trim().escape().optional().isNumeric(),
        check('longitude').trim().escape().optional().isNumeric(),
        check('website').trim().escape().optional().isLength({max: 255}),
        check('email').trim().escape().optional().isLength({max: 255}).isEmail(),
        check('patients').trim().optional().isNumeric(),
    ], (req,res) => {  
        Atlas.update({
            name: req.body.name,
            description: req.body.description,
            location: req.body.location,
            latitude:  req.body.latitude, 
            longitude: req.body.longitude,
            website: req.body.website, 
            email: req.body.email, 
            patients: req.body.patients
        }, {
            where: {
                id: req.params.id
            }
        }).then(
            Atlas.findOne({
                where: {
                    id: req.params.id
                }
            }).then((atlas) => {
                if(Array.isArray(req.body.products)){
                    atlas.setProducts(req.body.products);
                }else{
                    atlas.setProducts([req.body.products]);
                }
            })
        )
    });
    
    apiroute.get('/products', (req,res) => {
        Product.findAll({
            include: [{
                model: Version,
                as: 'versions',
                required: false
            }]
        }).then(product =>
            res.json(product)
        );
    });
    
apiroute.post('/products', [        
    emptyString,
    check('name').trim().escape().isLength({min: 1, max: 255}),
    check('description').trim().escape().optional().isLength({max: 255}),
    check('marker_pcolor').trim().escape().optional().isLength({max: 255}),
    check('marker_scolor').trim().escape().optional().isLength({max: 255}),
],(req,res) => {    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: message() });
    }

    Product.create({
        name: req.body.name,
        description: req.body.description,
        marker_pcolor: req.body.marker_pcolor,
        marker_scolor: req.body.marker_scolor,
    }).then(() => {res.redirect("/admin/products");})        
});
    
apiroute.put('/products/:id', (req,res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: message() });
    }

    Product.update({
        name: req.body.name,
        description: req.body.description,
        marker_pcolor: req.body.marker_pcolor,
        marker_scolor: req.body.marker_scolor,
    }, {
        where: {
            id: req.params.id
        }
    }).then(() => {res.redirect("/admin/products");})        
});
        
    
    apiroute.get('/versions/:productid', (req,res) => {
        var id = req.params.productid;
        Version.findAll({
            where: {ProductId: id}
        }).then(result => res.json(result))
    })
    
    apiroute.post('/versions/:productid', 
    [        
        emptyString,
        check('name').trim().escape().isLength({min: 3, max: 255})
    ]
    , (req,res) => {
        let tempid = req.params.productid;
        Version.create({
            name: req.body.name,
            productId: tempid
        }).then(() => {
            res.redirect("/admin/products");   
        })
    });

    return apiroute;
};