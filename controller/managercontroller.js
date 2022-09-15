require('../model/employeemodel')
require('../model/accountsmodal')
const mongoose = require('mongoose');


const Loaders = mongoose.model('Loaders');

var fs = require('fs');


exports.deleteloader = (req, res) => {


    Loaders.findByIdAndDelete(req.body.id).then((docs, err) => {
        if (err) console.log(err)
        return res.redirect('/loaderslist')
    })


}
