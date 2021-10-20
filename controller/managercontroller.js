require('../model/employeemodel')
require('../model/accountsmodal')
const mongoose = require('mongoose');


const Loaders = mongoose.model('Loaders');

var fs = require('fs');

const Lorirent = mongoose.model('Lorirent');

exports.Lorirent = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

        Lorirent.find().distinct('registration').then(loads => {
            res.render('maddlorirent', {
                doc: loads,
                mainpath: '/maddlorirent',
                errorMessage: message,
                
            })
        
    })

}
exports.postLorirent = (req, res) => {
    var number = req.body.loari.toUpperCase()
    Lorirent.findOne({ registration: number }).then(docs => {
        if (docs) {
            docs.updateOne({
                    $push: {
                        "trips": {
                            date: req.body.date,
                            loadto: req.body.loadto,
                            product: req.body.content,
                            driver: req.body.driver,
                            rent: req.body.rent,
                            monitor:req.session.user.name
                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    
                        req.flash('error', "successfully added")
                        res.redirect('/manager/addlorirent')
                    

                })
        } else {
            var lorirent = new Lorirent({
                registration: number,
                trips: [{
                    date: req.body.date,
                    loadto: req.body.loadto,
                    product: req.body.content,
                    driver: req.body.driver,
                    rent: req.body.rent,
                     monitor:req.session.user.name
                }],
            })
            lorirent.save((err, docs) => {
                if (err) console.log(err)
                req.flash('error', "successfully added")
                    res.redirect('/manager/addlorirent')
             
            })
        }
    }).catch(err => {

        req.flash('error', "some error occured")
        res.redirect('/manager/addlorirent')
    })



}
exports.deleteloader = (req, res) => {


    Loaders.findByIdAndDelete(req.body.id).then((docs, err) => {
        if (err) console.log(err)
        return res.redirect('/loaderslist')
    })


}
exports.deleteloari = (req, res) => {


    Lorirent.findByIdAndDelete(req.body.id).then((docs, err) => {
        if (err) console.log(err)
        return res.redirect('/lorilist')
    })
}