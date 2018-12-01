var express = require('express');
const Atlas = require('../models').Atlas;
const Product = require('../models').Product;
const Version = require('../models').Version;
var jwt = require('jsonwebtoken');

const { check, validationResult } = require('express-validator/check');

module.exports = (app) => {
    var apiroute = express.Router();

    var getjwttoken = function (req) {
        var token = null;
        token = req.cookies.access_token;
        if (token) {
            token = jwt.verify(token, app.get('Secret'));
        }
        return token;
    };

    var emptyString = (req, res, next) => {
        console.log(req.body);
        for (let prop in req.body) {
            if (req.body[prop] == "") {
                req.body[prop] = undefined
                console.log(prop)
            }
        }
        next();
    }

    apiroute.post('/atlas', [
        emptyString,
        check('name').trim().escape().isLength({ min: 3, max: 255 }),
        check('description').trim().escape().optional().isLength({ max: 255 }),
        check('location').trim().escape().optional().isLength({ max: 255 }),
        check('latitude').trim().escape().optional().isNumeric(),
        check('longitude').trim().escape().optional().isNumeric(),
        check('website').trim().escape().optional().isLength({ max: 255 }),
        check('email').trim().escape().optional().isLength({ max: 255 }).isEmail(),
        check('patients').trim().optional().isNumeric(),
    ], (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.session.errormessages = errors + "ERRORS!";
            res.redirect('/admin');
        }else{
            token = getjwttoken(req);
            var creator;
            if (token) {
                creator = token.user._id
            }
            Atlas.create({
                name: req.body.name,
                description: req.body.description,
                location: req.body.location,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                website: req.body.website,
                email: req.body.email,
                patients: req.body.patients,
                creatorId: creator
            }).then((created) => {
                if (req.body.products) {
                    if (Array.isArray(req.body.products)) {
                        for (var i = 0; i < req.body.products.length; i++) {
                            created.addProducts(req.body.products[i])
                        }
                    } else {
                        created.addProducts(req.body.products);
                    }
                }
    
            }).then(() => { res.redirect("/admin"); })    
        }
    });
    //Get All
    apiroute.get('/atlas', (req, res) => {
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

    //Get by ID
    apiroute.get('/atlas/:id', (req, res) => {
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

    //Delete by ID
    apiroute.delete('/atlas/:id', (req, res) => {
        
        token = getjwttoken(req);
        if (token) {
            Atlas.findOne({
                where: {
                    id: req.params.id
                }
            }).then((result) => {
                if(result){
                    if (token.user.admin || token.user._id == result.creatorId){
                        Atlas.destroy({
                            where: {
                                id: req.params.id
                            }
                        });
                    } else {
                        res.render('denied');
                    }        
                }else{
                    res.render('denied');
                }
            });
        } else {
            res.render('denied');
        }
    });

    //Get by Owner
    apiroute.get('/atlas/created/:id', (req, res) => {
        var token = getjwttoken(req);
        console.log('in');
        if (token) {
            if (token.admin || req.params.id == token.user._id) {
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
                    }],
                    where: {
                        creatorId: req.params.id
                    }
                }).then(atlases => res.json(atlases));
            } else {
                res.redirect('/denied');
            }
        } else {
            res.redirect('/denied');
        }
    });

    //Update by Id
    apiroute.put('/atlas/:id', [
        emptyString,
        check('name').trim().escape().isLength({ min: 3, max: 255 }),
        check('description').trim().escape().optional().isLength({ max: 255 }),
        check('location').trim().escape().optional().isLength({ max: 255 }),
        check('latitude').trim().escape().optional().isNumeric(),
        check('longitude').trim().escape().optional().isNumeric(),
        check('website').trim().escape().optional().isLength({ max: 255 }),
        check('email').trim().escape().optional().isLength({ max: 255 }).isEmail(),
        check('patients').trim().optional().isNumeric(),
    ], (req, res) => {
        token = getjwttoken();
        if (token.admin) {
            Atlas.update({
                name: req.body.name,
                description: req.body.description,
                location: req.body.location,
                latitude: req.body.latitude,
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
                        if (Array.isArray(req.body.products)) {
                            atlas.setProducts(req.body.products);
                        } else {
                            atlas.setProducts([req.body.products]);
                        }
                    })
                )
        } else {
            res.render('denied')
        }
    });

    apiroute.get('/products', (req, res) => {
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
        check('name').trim().escape().isLength({ min: 1, max: 255 }),
        check('description').trim().escape().optional().isLength({ max: 255 }),
        check('marker_pcolor').trim().escape().optional().isLength({ max: 255 }),
        check('marker_scolor').trim().escape().optional().isLength({ max: 255 }),
    ], (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.session.errormessages = errors + "ERRORS!";
            res.redirect('/admin');
        }else{
            var token = getjwttoken(req);
            console.log(token);
            if (token) {
                console.log(token.user.admin);
                if (token.user.admin == true) {
                    console.log('allrounds')
                        Product.create({
                            name: req.body.name,
                            description: req.body.description,
                            marker_pcolor: req.body.marker_pcolor,
                            marker_scolor: req.body.marker_scolor,
                    }).then(() => { res.redirect("/admin/products"); });    
                }else{
                    res.redirect('/denied');
                }
            }else{
                res.redirect('denied');
            }
        }
    });

    apiroute.put('/products/:id', [
        emptyString,
        check('name').trim().escape().isLength({ min: 1, max: 255 }),
        check('description').trim().escape().optional().isLength({ max: 255 }),
        check('marker_pcolor').trim().escape().optional().isLength({ max: 255 }),
        check('marker_scolor').trim().escape().optional().isLength({ max: 255 }),
    ], (req, res) => {

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
            }).then(() => { res.redirect("/admin/products"); })
    });


    apiroute.get('/versions/:productid', (req, res) => {
        var id = req.params.productid;
        Version.findAll({
            where: { ProductId: id }
        }).then(result => res.json(result))
    })

    apiroute.post('/versions/:productid',
        [
            emptyString,
            check('name').trim().escape().isLength({ min: 3, max: 255 })
        ]
        , (req, res) => {
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