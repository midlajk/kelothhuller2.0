require('../model/employeemodel')
require('../model/accountsmodal')
const mongoose = require('mongoose');


const Loaders = mongoose.model('Loaders');
const Payments = mongoose.model('Payments');

var fs = require('fs');


exports.deleteloader = (req, res) => {
    Loaders.findOne({ _id: req.body.id }).then(docs => {
        if (docs) {
            docs.payed.forEach(one => {

                Payments.findOneAndDelete({ _id: one._id }).then((err, docs) => {

                })
            });
        }
    }).then(docs => {
        Loaders.findOneAndDelete({ _id: req.body.id }).then((err, docs) => {
            res.redirect('/loaderslist')
        })

    })
  

}
