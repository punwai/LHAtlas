var express = require('express');
const User = require('../models').User;

module.exports = (app) => {
    var admin = express.Router();

    admin.get('/', (req, res) => {
        if (req.isAuthenticated()) {
            console.log(req.user);
            res.render('admindash', { admin: req.user.admin, userid: req.user.id, errormessages: req.session.errormessages });
        } else {
            res.render("denied");
        }
    })

    admin.get('/products', (req, res) => {
        if (req.isAuthenticated()) {
            if (req.user.admin) {
                res.render('adminproduct', { admin: req.user.admin, userid: req.user.id, errormessages: req.session.errormessages });
            } else {
                res.redirect('/denied');
            }
        } else {
            res.redirect('/denied');
        }
    })

    admin.get('/setadmin/:id', (req,res) => {
        if (req.isAuthenticated()) {
            console.log('inhere');
            if (req.user.admin) {
                console.log('inhere');
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
                res.render('adminusers', { admin: req.user.admin, userid: req.user.id, errormessages: req.session.errormessages });
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