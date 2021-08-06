require('../model/accountsmodal')
const mongoose = require('mongoose');
var fs = require('fs');

const Lorirent = mongoose.model('Lorirent');

exports.addlorirent = (req, res) => {
    Lorirent.aggregate([{ $unwind: "$trips" }]).then(docs => {
        res.render('addlorirent', {
            mainpath: '/addlorirent',
            docs: docs

        })
    })



}
exports.postaddlorirent = (req, res) => {
    var number = req.body.loari.toLowerCase()
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
                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    res.redirect('/addlorirent')
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
                }],
            })
            lorirent.save((err, docs) => {
                if (err) console.log(err)
                res.redirect('/addlorirent')
            })
        }
    }).catch(err => {
        console.log(err)
    })



}