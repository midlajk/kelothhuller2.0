require('../model/accountsmodal')
require('../model/employeemodel')
const mongoose = require('mongoose');
var fs = require('fs');
const bcrypt = require('bcryptjs');
const Sellers = mongoose.model('Sellers');
const Buyers = mongoose.model('Buyers');
const Payments = mongoose.model('Payments');
const Loaders = mongoose.model('Loaders');
const Loaderskooli = mongoose.model('Loaderskooli');

exports.dealerslist = (req, res) => {
    Buyers.aggregate([{
        $addFields: {
            totalsales: { $sum: "$deal.tds" },
            totalkg: { $sum: "$deal.kilogram" },
            totalpaid: { $sum: "$deal.paid" }
        }
    }]).sort({ "_id": -1 }).exec((err, data) => {
        Sellers.aggregate([{
            $addFields: {
                totalsales: { $sum: "$deal.total" },
                totalkg: { $sum: "$deal.kilogram" },
                totalpaid: { $sum: "$deal.paid" }
            }
        }]).sort({ "_id": -1 }).exec((err, dics) => {

            res.render('dealerslist', {
                mainpath: '/dealers',
                docs: data,
                dics: dics,
                start: 'start',
                end: 'end'
            })
        })
    })

}
exports.filterdelerslist = (req, res) => {

    start = new Date(req.body.sdate);
    bdate = new Date(req.body.sdate);
    end = new Date(req.body.edate);
    start.setDate(start.getDate() - 1);
    Buyers.aggregate([{
            "$match": {
                "deal.date": { $gte: start, $lt: end }
            }
        },
        {
            "$project": {
                "name": 1,
                "values": {
                    "$filter": {
                        "input": "$deal",
                        "as": "value",
                        "cond": {
                            "$and": [
                                { "$gt": ["$$value.date", start] },
                                { "$lt": ["$$value.date", end] }
                            ]
                        }
                    }
                },

            }
        },
        {
            $addFields: {
                totalsales: { $sum: "$deal.total" },
                totalkg: { $sum: "$deal.kilogram" },
                totalpaid: { $sum: "$deal.paid" }

            }
        }


    ]).sort({ "_id": -1 }).exec((err, data) => {
        Sellers.aggregate([{
                "$match": {
                    "deal.date": { $gte: start, $lt: end }
                }
            },
            {
                "$project": {
                    "name": 1,
                    "values": {
                        "$filter": {
                            "input": "$deal",
                            "as": "value",
                            "cond": {
                                "$and": [
                                    { "$gt": ["$$value.date", start] },
                                    { "$lt": ["$$value.date", end] }
                                ]
                            }
                        }
                    },

                }
            },
            {
                $addFields: {
                    totalsales: { $sum: "$deal.tds" },
                    totalkg: { $sum: "$deal.kilogram" },
                    totalpaid: { $sum: "$deal.paid" }

                }
            }


        ]).sort({ "_id": -1 }).exec((err, dics) => {
            res.render('dealerslist', {
                mainpath: '/dealers',
                docs: data,
                dics: dics,
                start: bdate.toLocaleDateString(),
                end: end.toLocaleDateString()


            })
        })
    })

}
exports.loaderslist = (req, res) => {
    var start = new Date(08 / 03 / 2000)
    var end = new Date()
    Loaders.aggregate([{
        $addFields: {
            totalbags: { $sum: "$work.numberofsack" },
            totalamount: { $sum: "$work.kooli" },
            totalpaid: { $sum: "$payed.amount" },

        }
    }]).sort({ "_id": -1 }).exec((err, data) => {
        Loaderskooli.aggregate([{ $unwind: "$order" }, { $group: { _id: "null", gross: { $sum: "$order.numberofsack" } } }]).then((datas, err) => {
            console.log(datas[0].gross)
            res.render('loaderslist', {
                mainpath: '/loaderslist',
                docs: data,
                numberofsac: datas[0].gross,
                start: start,
                end: end,

            })
        })
    })

}
exports.deletedealersales = (req, res) => {
    bcrypt.compare(req.body.password, req.session.user.password)
        .then(doMatch => {
            if (doMatch) {
                Buyers.findOne({ id: req.body.objectid }).then(docs => {
                    if (docs) {

                        docs.deal.forEach(one => {

                            Payments.findOneAndDelete({ _id: one.id }).then((err, docs) => {

                            })
                        });
                    }
                }).then(docs => {
                    Buyers.findOneAndDelete({ id: req.body.objectid }).then((err, docs) => {
                        res.redirect('/dealerslist')
                    })

                })
            } else {
                res.redirect('/dealerslist')
            }

        })
}
exports.deletedealerpurchase = (req, res) => {

    bcrypt.compare(req.body.password, req.session.user.password)
        .then(doMatch => {
            if (doMatch) {
                Sellers.findOne({ id: req.body.objectid }).then(docs => {
                    if (docs) {

                        docs.deal.forEach(one => {

                            Payments.findOneAndDelete({ _id: one.id }).then((err, docs) => {

                            })
                        });
                    }
                }).then(docs => {
                    Sellers.findOneAndDelete({ id: req.body.objectid }).then((err, docs) => {
                        res.redirect('/dealerslist')
                    })

                })
            } else {
                res.redirect('/dealerslist')
            }

        })
}