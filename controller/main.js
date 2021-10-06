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
            req.flash('error', 'Invalid phone or password.');
            return res.redirect('/login');
        } else {
            bcrypt.compare(password, docs.password)
                .then(doMatch => {
       
                    if (doMatch) {
                        if (docs.previlage == 'fullprevilage') {
                            req.session.userPrevileage = "admin";
                        } else if (docs.previlage == 'halfprevilage') {
                            req.session.userPrevileage = "manager";
                        } else {
                            req.session.userPrevileage = "writer";
                        }

                        req.session.user = docs;
                        return req.session.save(err => {
                            console.log(err)
                            res.redirect('/dashboard')
                        });
                    }
                    req.flash('error', 'Invalid email or password.');
                    res.redirect('/login');
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