var express = require('express');
const User = require('../models').User;
const { check, validationResult } = require('express-validator/check');

module.exports = (app) => {
    var admin = express.Router();

    admin.get('/', (req, res) => {
        if (req.isAuthenticated()) {
            var successmessage = req.session.successmessage;
            req.session.successmessage = "";
            var errormessage = req.session.errormessage;
            req.session.errormessages = "";
            res.render('admindash', { admin: req.user.admin, userid: req.user.id, errormessages: errormessage, successmessage: successmessage });
    } else {
            res.render("denied");
        }
    })

    admin.get('/products', (req, res) => {
        if (req.isAuthenticated()) {
            if (req.user.admin) {
                var successmessage = req.session.successmessage;
                req.session.successmessage = "";
                var errormessage = req.session.errormessage;
                req.session.errormessages = "";    
                res.render('adminproduct', { admin: req.user.admin, userid: req.user.id, errormessages: errormessage, successmessage: successmessage });
            } else {
                res.redirect('/denied');
            }
        } else {
            res.redirect('/denied');
        }
    })

    admin.get('/users', (req,res) => {
        if (req.isAuthenticated()) {
            if (req.user.admin) {
                var successmessage = req.session.successmessage;
                req.session.successmessage = "";
                var errormessage = req.session.errormessage;
                req.session.errormessages = "";    
                res.render('adminusers', { admin: req.user.admin, userid: req.user.id, errormessages: errormessage, successmessage: successmessage });
            } else {
                res.redirect('/denied');
            }
        } else {
            res.redirect('/denied');
        }
    });

    admin.get('/manage/users', (req,res) => {
        if (req.isAuthenticated()) {
            if (req.user.admin) {
                User.findAll().then((users) => {
                    res.json(users);
                });
            }else{
                return res.status(403).json({error: "You are not authorised for this action"});
            }
        }else{
            return res.status(403).json({error: "You are not logged in"});
        }
    });

    admin.delete('/manage/users', [
        check('toAdmin').trim().escape().isBoolean().withMessage('invalid role for user sent')
    ],
    (req,res) => {
        if (req.isAuthenticated()) {
            if (req.user.admin) {
                User.destroy(
                    {where: {id: req.body.checkboxes}}
                ).then(function(rowsUpdated) {
                    if(rowsUpdated){
                        req.session.successmessage = "Success!!!"
                        return res.status(400).json(rowsUpdated);
                    }else{
                        req.session.errormessages = "No users found"
                        return res.status(404).json({error: "Users Not Found"});
                    }
                });
            } else {
                return res.status(403).json({error: "You are not authorised for this action"});
            }
        } else {
            return res.status(403).json({error: "You are not logged in"});
        }
    });

    admin.put('/manage/users/', [
        check('toAdmin').trim().escape().isBoolean().withMessage('invalid role for user sent')
    ], (req,res) => {
        if (req.isAuthenticated()) {
            if (req.user.admin) {
                console.log(req.body)
                User.update(
                    {admin: req.body.toAdmin},
                    {where: {id: req.body.checkboxes}}
                ).then(function(rowsUpdated) {
                    if(rowsUpdated){
                        req.session.successmessage = "Success!!!"
                        return res.status(400).json(rowsUpdated);
                    }else{
                        req.session.errormessages = "No users found"
                        return res.status(404).json({error: "Users Not Found"});
                    }
                });
            } else {
                return res.status(403).json({error: "You are not authorised for this action"});
            }
        } else {
            return res.status(403).json({error: "You are not logged in"});
        }
    });

    admin.put('/manage/users/:id', (req,res) => {
        if (req.isAuthenticated()) {
            if (req.user.admin) {
                User.update(
                    {admin: req.body.toAdmin},
                    {where: {id: req.params.id}}
                ).then(function(rowsUpdated) {
                    if(rowsUpdated){
                        req.session.errormessages = "Success!!!"
                        return res.status(400).json(rowsUpdated);
                    }else{
                        return res.status(404).json({error: "User Not Found"});
                    }
                })
            }else{
                return res.status(403).json({error: "You are not authorised for this action"});
            }
        }else{
            return res.status(403).json({error: "You are not logged in"});
        }
    });

    return admin;
}