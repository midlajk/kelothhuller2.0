require('../model/accountsmodal')
const mongoose = require('mongoose');
const Utility = mongoose.model('Utility');
var fs = require('fs');

const Lorirent = mongoose.model('Lorirent');

exports.addlorirent = (req, res) => {
    var start = new Date()
    var end = new Date()
    end.setDate(end.getDate() + 1)
    start.setMonth(start.getMonth() - 1);
    Lorirent.aggregate([{ $unwind: "$trips" },{
        $match: {

            "trips.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "trips.date": -1, "trips._id": -1 }).exec((err, docs) => {
        Lorirent.find().distinct('registration').then(loari => {

        res.render('addlorirent', {
            mainpath: '/addlorirent',
            docs: docs,
            loari:loari,
            start: start,
            end: end,
            individual:false

        })
    })
    })



}
exports.postaddlorirent = (req, res) => {
    console.log(req.body.driver)
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
                            
                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    if (req.body.type == 'individual') {
                        res.redirect('/addindividuallorirent/' + name)
                    } else {
                        res.redirect('/addlorirent')
                    }
            
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
exports.fliteraddlorirent = (req, res) => {
    start = new Date(req.body.sdate);
    end = new Date(req.body.edate);

    Lorirent.aggregate([{ $unwind: "$trips" },{
        $match: {

            "trips.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "trips.date": -1, "trips._id": -1 }).exec((err, docs) => {
        Lorirent.find().distinct('registration').then(loari => {

        res.render('addlorirent', {
            mainpath: '/addlorirent',
            docs: docs,
            loari:loari,
            start: start,
            end: end,
            individual:false

        })
    })
    })



}

exports.addindividuallorirent = (req, res) => {
    name = req.params.id.toUpperCase()
    console.log(req.params.id.toUpperCase())
    var start = new Date()
    var end = new Date()
    end.setDate(end.getDate() + 1)
    start.setMonth(start.getMonth() - 1);
    Lorirent.aggregate([{
        $match: {
            "registration": req.params.id.toUpperCase()
        }
    },{ $unwind: "$trips" },{
        $match: {

            "trips.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "trips.date": -1, "trips._id": -1 }).exec((err, docs) => {
        Lorirent.find().distinct('registration').then(loari => {

        res.render('addlorirent', {
            mainpath: '/addlorirent',
            docs: docs,
            loari:loari,
            start: start,
            end: end,
            id:name,
            individual:true

        })
    })
    })



}
exports.fliterindividualaddlorirent = (req, res) => {
    name = req.body.id.toUpperCase(),
    console.log(req.body.id.toUpperCase(),)
    start = new Date(req.body.sdate);
    end = new Date(req.body.edate);

    Lorirent.aggregate([{
        $match: {
            "registration": req.body.id.toUpperCase()
        }
    },{ $unwind: "$trips" },{
        $match: {

            "trips.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "trips.date": -1, "trips._id": -1 }).exec((err, docs) => {
        Lorirent.find().distinct('registration').then(loari => {

        res.render('addlorirent', {
            mainpath: '/addlorirent',
            docs: docs,
            loari:loari,
            start: start,
            end: end,
            id:name,
            individual:true

        })
    })
    })



}

exports.filterutility = (req, res) => {
    start = new Date(req.body.sdate);
    end = new Date(req.body.edate);

    
    Utility.aggregate([{ $unwind: "$detail" },{
        $match: {

            "detail.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "detail.date": -1, "detail._id": -1 }).exec((err, docs) => {
        Utility.find().distinct('name').then(utitlity => {

            res.render('utilitybill', {
                mainpath: '/adduser',
                docs: docs,
                start: start,
                end: end,
                individual: false,
                utitlity: utitlity,

            })
    })
    })

}

exports.indivual_utility = (req, res) => {
    name = req.params.id.toUpperCase()
    var start = new Date()
    var end = new Date()
    end.setDate(end.getDate() + 1)
    start.setMonth(start.getMonth() - 1);
    Utility.aggregate([{
        $match: {
            "name": req.params.id.toUpperCase()
        }
    },{ $unwind: "$detail" },{
        $match: {

            "detail.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "detail.date": -1, "detail._id": -1 }).exec((err, docs) => {
        Utility.find().distinct('name').then(utitlity => {

            res.render('utilitybill', {
                mainpath: '/adduser',
                docs: docs,
                start: start,
                end: end,
                individual: true,
                id:name,
                utitlity: utitlity,

            })
    })
    })

}
exports.filterindividualutility = (req, res) => {
    name = req.body.id.toUpperCase(),
 
    start = new Date(req.body.sdate);
    end = new Date(req.body.edate);

    Utility.aggregate([{
        $match: {
            "name": req.body.id.toUpperCase()
        }
    },{ $unwind: "$detail" },{
        $match: {

            "detail.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "detail.date": -1, "detail._id": -1 }).exec((err, docs) => {
        Utility.find().distinct('name').then(utitlity => {

            res.render('utilitybill', {
                mainpath: '/adduser',
                docs: docs,
                start: start,
                end: end,
                individual: true,
                id:name,
                utitlity: utitlity,

            })
    })
    })



}