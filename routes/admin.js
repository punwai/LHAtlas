var express = require('express');
const User = require('../models').User;

module.exports = (app) => {
    var admin = express.Router();

    admin.get('/', (req, res) => {
        if (req.isAuthenticated()) {
            var errormessage = req.session.errormessages;
            req.session.errormessages = "";
            res.render('admindash', { admin: req.user.admin, userid: req.user.id, errormessages: errormessage });
        } else {
            res.render("denied");
        }
    })

    admin.get('/products', (req, res) => {
        if (req.isAuthenticated()) {
            if (req.user.admin) {
                var errormessage = req.session.errormessages;
                req.session.errormessages = "";
                res.render('adminproduct', { admin: req.user.admin, userid: req.user.id, errormessages: errormessage });
            } else {
                res.redirect('/denied');
            }
        } else {
            res.redirect('/denied');
        }
    })

    admin.get('/setadmin/:id', (req,res) => {
        if (req.isAuthenticated()) {
            if (req.user.admin) {
                User.update(
                    {admin: 1},
                    {where: {id: req.params.id}}
                ).then(function(rowsUpdated) {
                    if(rowsUpdated){
                        req.session.errormessages = "Success!!!"
                        res.redirect('/admin/manageusers');
                    }else{
                        req.session.errormessages = "No users found"
                        res.redirect('/admin/manageusers')
                    }
                })
            }else{
                res.redirect('/denied');
            }
        }else{
            res.redirect('/denied');
        }
    });

    admin.get('/getusers', (req,res) => {
        if (req.isAuthenticated()) {
            if (req.user.admin) {
                User.findAll().then((users) => {
                    res.json(users);
                });
            }else{
                res.redirect('/denied');
            }
        }else{
            res.redirect('/denied');
        }
    });

    admin.get('/manageusers', (req,res) => {
        if (req.isAuthenticated()) {
            if (req.user.admin) {
                var errormessage = req.session.errormessages;
                req.session.errormessages = "";
                res.render('adminusers', { admin: req.user.admin, userid: req.user.id, errormessages: errormessage });
            } else {
                res.redirect('/denied');
            }
        } else {
            res.redirect('/denied');
        }
    });

    admin.get('/unsetadmin/:id', (req,res) => {
        if (req.isAuthenticated()) {
            if (req.user.admin) {
                User.update(
                    {admin: 0},
                    {where: {id: req.params.id}}
                ).then(function(rowsUpdated) {
                    if(rowsUpdated){
                        req.session.errormessages = "Success!!!"
                        res.redirect('/admin/manageusers');
                    }else{
                        req.session.errormessages = "No users found"
                        res.redirect('/admin/manageusers')
                    }
                })
            }else{
                res.redirect('/denied');
            }
        }else{
            res.redirect('/denied');
        }
    });

    return admin;
}