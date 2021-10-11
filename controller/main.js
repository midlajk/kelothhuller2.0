require('../model/accountsmodal')
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
var fs = require('fs');

const Users = mongoose.model('Users');
exports.mainpage = (req, res) => {

    res.render('main', {
        mainpath: '/mainpage',

    })


}
exports.postloginpage = (req, res) => {
    var name = req.body.name.toUpperCase()
    var password = req.body.password
    Users.findOne({ name: name }).then(docs => {
        if (!docs) {

            req.flash('error', 'No user registered.');
            return res.redirect('/login');
        } else {

            bcrypt.compare(password, docs.password)
                .then(doMatch => {

                    if (doMatch) {
                        if (docs.previlage == 'fullprevilage') {
                            req.session.userPrevileage = "admin";
                            req.session.isadminlogged = true;
                            req.session.ismanager = false;
                        } else {
                            req.session.userPrevileage = "manager";
                            req.session.isadminlogged = false;
                            req.session.ismanager = true;
                        }

                        req.session.user = docs;
                        return req.session.save(err => {
                            console.log(err)
                            res.redirect('/transaction')
                        });
                    }
                    req.flash('error', 'Invalid email or password.');
                    res.redirect('/login');
                }).catch(err => {
                    console.log(err)
                })

        }
    })


}

exports.loginpage = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('login', {
        mainpath: '/mainpage',

        errorMessage: message
    })

}
exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/login');
    });

};