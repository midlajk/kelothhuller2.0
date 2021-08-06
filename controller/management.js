require('../model/accountsmodal')
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
var fs = require('fs');
const Sellers = mongoose.model('Sellers');
const Users = mongoose.model('Users');
const Buyers = mongoose.model('Buyers');
const Sellerpayment = mongoose.model('Sellerpayment');
const Buyerspayment = mongoose.model('Buyerspayment');
const Utility = mongoose.model('Utility');


exports.accountmanagement = (req, res) => {
    var start = new Date()
    var end = new Date()
    start.setMonth(start.getMonth() - 1);
    Buyers.aggregate([{ $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        },
        {
            "$addFields": {
                "total_bag": {
                    "$sum": { "$sum": "$deal.bags" }
                },
                "total_amount": {
                    "$sum": { "$sum": "$deal.total" }
                },

            }

        }
    ]).then(data => {
        Sellers.aggregate([{ $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            },

        }, {
            "$addFields": {
                "total_bag": {
                    "$sum": { "$sum": "$deal.bags" }
                },
                "total_amount": {
                    "$sum": { "$sum": "$deal.total" }
                },

            }

        }]).then(datas => {
            console.log(datas)
            res.render('accountmanagement', {
                mainpath: '/accountmanagement',
                subpath: '',
                buyer: data,
                seller: datas,
                start: start,
                end: end
            })
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));

}



exports.filtrsales = (req, res) => {


    var end = new Date()
    var start = new Date()
    var totals = {
        "$addFields": {
            "total_bag": {
                "$sum": { "$sum": "$deal.bags" }
            },
            "total_amount": {
                "$sum": { "$sum": "$deal.total" }
            },

        }

    }
    var filter = [{ $unwind: "$deal" }, totals]
    if (req.body.type == 'filter') {

        start = new Date(req.body.sdate);
        end = new Date(req.body.edate);
        filter = [{ $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }, totals]

    } else if (req.body.type == '2months') {
        start.setMonth(start.getMonth() - 2);
        console.log(start)

        filter = [{ $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }, totals]
    } else if (req.body.type == '5months') {
        start.setMonth(start.getMonth() - 5);
        console.log(start)
        console.log(end)
        filter = [{ $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }, totals]

    } else if (req.body.type == 'year') {
        start.setFullYear(start.getFullYear() - 1);
        console.log(start)

        filter = [{ $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }, totals]
    } else {
        start = new Date(08 / 03 / 2000)

        filter = [{ $unwind: "$deal" }, totals]

    }

    Buyers.aggregate(filter).then(data => {
        Sellers.aggregate(filter).then(datas => {
            res.render('accountmanagement', {
                mainpath: '/accountmanagement',
                subpath: '',
                buyer: data,
                seller: datas,
                start: start,
                end: end
            })
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));

}
exports.postdetailedbuyerdata = (req, res) => {
    console.log("here")
    var name = req.body.buyer.toLowerCase();
    Sellers.findOne({ name: name }).then((docs, err) => {
        if (err) {
            console.log(err)
        }
        if (docs) {
            docs.updateOne({
                    $push: {
                        "deal": {
                            date: req.body.date,
                            bags: req.body.bags,
                            kilogram: req.body.kilogram,
                            price: req.body.price,
                            total: req.body.price * req.body.kilogram,
                            paid: req.body.paid,
                            remaining: (parseInt(req.body.price * req.body.kilogram) - parseInt(req.body.paid)),
                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    Sellerpayment.findOne({ name: name }).then(docs => {
                        if (!docs) {

                        } else {
                            console.log(docs)
                            docs.total = parseInt(docs.total) + parseInt(req.body.remaining)
                            docs.updateOne({
                                    $push: {
                                        "paid": {
                                            date: req.body.date,
                                            order: req.body.date,
                                            amount: req.body.paid,
                                            agent: "not defined",
                                            typee: "bank",
                                            message: "",
                                        }

                                    },

                                }, { safe: true, upsert: true },
                                function(err, model) {

                                }
                            )
                            docs.updateOne({

                                    $push: {
                                        "payment": {
                                            date: req.body.date,
                                            amount: req.body.total,
                                            order: req.body.date,
                                            typee: "purchase",
                                            message: req.body.kilogram + "kg",
                                        }
                                    }
                                }, { safe: true, upsert: true },
                                function(err, model) {

                                }
                            )
                        }
                    })

                }
            )
        } else {
            var sellers = new Sellers({
                name: name,
                deal: [{
                    date: req.body.date,
                    orderid: req.body.date,
                    bags: req.body.bags,
                    kilogram: req.body.kilogram,
                    price: req.body.price,
                    total: req.body.price * req.body.kilogram,
                    paid: req.body.paid,
                    remaining: (parseFloat(req.body.price * req.body.kilogram) - parseFloat(req.body.paid)),

                }]

            })
            sellers.save(function(err, doc) {
                var sellerpayment = new Sellerpayment({
                    name: name,
                    total: doc.deal[0].remaining,
                    paid: [{
                        date: req.body.date,
                        order: req.body.date,
                        amount: req.body.paid,
                        agent: "not defined",
                        typee: "bank",
                        message: "",
                        remaining: doc.deal[0].remaining

                    }],
                    payment: [{
                        date: req.body.date,
                        amount: doc.deal[0].total,
                        order: req.body.date,
                        typee: "purchase",
                        message: doc.deal[0].kilogram + "kg",
                    }]
                })

                sellerpayment.save(function(err, docs) {
                    if (err) {
                        console.log(err);

                    }

                })
            })
        }
    }).then((err, docs) => {
        if (err) console.log(err)
        if (req.body.type == "seperate") {
            res.redirect('/purchasemanagement')
        } else {
            res.redirect('/accountmanagement')

        }
    })



}
exports.postbuyerform = (req, res) => {
    console.log("here")
    var name = req.body.buyer.toLowerCase();
    Buyers.findOne({ name: name }).then(docs => {
        if (docs) {

            docs.updateOne({
                    $push: {
                        "deal": {
                            date: req.body.date,
                            bags: req.body.bags,
                            kilogram: req.body.kilogram,
                            price: req.body.price,
                            total: req.body.price * req.body.kilogram,
                            paid: req.body.paid,
                            remaining: (parseInt(req.body.price * req.body.kilogram) - parseInt(req.body.paid)),
                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    console.log(err);
                    Buyerspayment.findOne({ name: name }).then(docs => {
                        if (!docs) {

                        } else {
                            console.log(docs)
                            docs.total = parseInt(docs.total) + parseInt(req.body.remaining)
                            docs.updateOne({
                                    $push: {
                                        "paid": {
                                            date: req.body.date,
                                            order: req.body.date,
                                            amount: req.body.paid,
                                            agent: "not defined",
                                            typee: "bank",
                                            message: "",
                                        }

                                    },

                                }, { safe: true, upsert: true },
                                function(err, model) {

                                }
                            )
                            docs.updateOne({

                                    $push: {
                                        "payment": {
                                            date: req.body.date,
                                            amount: req.body.total,
                                            order: req.body.date,
                                            typee: "purchase",
                                            message: req.body.kilogram + "kg",
                                        }
                                    }
                                }, { safe: true, upsert: true },
                                function(err, model) {

                                }
                            )
                        }
                    })
                }
            )
        } else {
            var buyers = new Buyers({
                name: name,
                deal: [{
                    date: req.body.date,
                    bags: req.body.bags,
                    kilogram: req.body.kilogram,
                    price: req.body.price,
                    total: req.body.price * req.body.kilogram,
                    paid: req.body.paid,
                    remaining: (parseInt(req.body.price * req.body.kilogram) - parseInt(req.body.paid)),

                }]

            })


            buyers.save(function(err, doc) {

                var buyerspayment = new Buyerspayment({
                    name: name,
                    total: doc.deal[0].remaining,
                    paid: [{
                        date: req.body.date,
                        order: req.body.date,
                        amount: req.body.paid,
                        agent: "not defined",
                        typee: "bank",
                        message: "",
                        remaining: doc.deal[0].remaining

                    }],
                    payment: [{
                        date: req.body.date,
                        amount: doc.deal[0].total,
                        order: req.body.date,
                        typee: "purchase",
                        message: doc.deal[0].kilogram + "kg",
                    }]
                })

                buyerspayment.save(function(err, docs) {
                    if (err) {
                        console.log(err);

                    }

                })

            })
        }
    }).then(docs => {
        if (req.body.type == "seperate") {
            res.redirect('/salesmanagement')
        } else {
            res.redirect('/accountmanagement')
        }
    })






}

exports.salesmanagement = (req, res) => {
    Buyers.aggregate([{ $unwind: "$deal" }]).then(datas => {
        res.render('salesmanagement', {
            mainpath: '/accountmanagement',
            subpath: '',
            buyer: datas,

        })
    }).catch(err => console.log(err));

}
exports.purchasemanagement = (req, res) => {
    Sellers.aggregate([{ $unwind: "$deal" }]).then(datas => {
        res.render('purchasemanagement', {
            mainpath: '/accountmanagement',
            subpath: '',
            seller: datas,

        })
    }).catch(err => console.log(err));

}
exports.individualaccounts = (req, res) => {
    Sellerpayment.aggregate([{ $unwind: "$paid" },
        { $unwind: "$payment" }
    ]).then(docs => {
        console.log(docs)
        res.render('individualaccounts', {
            mainpath: '/accountmanagement',
            subpath: '',
            doc: docs
        })
    })

}
exports.individualpurchase = (req, res) => {
    Sellers.findById(req.params.id).then(docs => {
        res.render('individualsalesandpurchase', {
            mainpath: '/accountmanagement',
            category: 'purchase',
            subpath: '',
            data: docs
        })
    }).catch(err => console.log(err));

}
exports.individualsales = (req, res) => {
    Buyers.findById(req.params.id).then(docs => {
        console.log(docs)
        res.render('individualsalesandpurchase', {
            mainpath: '/accountmanagement',
            category: 'sales',
            subpath: '',
            data: docs
        })
    }).catch(err => console.log(err));

}
exports.updateindividualsales = (req, res) => {

    Buyers.findById(req.body.id).then(docs => {
        if (docs) {

            docs.updateOne({
                    $push: {
                        "deal": {
                            date: req.body.date,
                            bags: req.body.bags,
                            kilogram: req.body.kilogram,
                            price: req.body.price,
                            total: req.body.price * req.body.kilogram,
                            paid: req.body.paid,
                            remaining: (parseInt(req.body.price * req.body.kilogram) - parseInt(req.body.paid)),
                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    console.log(err);

                }
            )
        }
    }).then(docs => {

        res.redirect('/individualsales/' + req.body.id)

    })

}
exports.updateindividualpuchase = (req, res) => {

    Sellers.findById(req.body.id).then(docs => {
        if (docs) {

            docs.updateOne({
                    $push: {
                        "deal": {
                            date: req.body.date,
                            bags: req.body.bags,
                            kilogram: req.body.kilogram,
                            price: req.body.price,
                            total: req.body.price * req.body.kilogram,
                            paid: req.body.paid,
                            remaining: (parseInt(req.body.price * req.body.kilogram) - parseInt(req.body.paid)),
                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    console.log(err);

                }
            )
        }
    }).then(docs => {

        res.redirect('/individualpurchase/' + req.body.id)

    })

}

exports.adduser = (req, res) => {
    Users.find().then(docs => {
        res.render('aduser', {
            mainpath: '/adduser',
            docs: docs

        })
    })



}
exports.postadduser = (req, res) => {
    var name = req.body.name.toLowerCase()
    var password = req.body.password
    Users.findOne({ name: name })
        .then(userDoc => {
            if (userDoc) {

                return res.redirect('/auth/register');
            }
            return bcrypt
                .hash(password, 12)
                .then(hashedPassword => {
                    const user = new Users({
                        name: name,
                        role: req.body.role,
                        password: hashedPassword,
                        previlage: req.body.previlage,

                    });
                    return user.save();
                })
                .then(result => {

                    res.redirect('/adduser')
                });
        })
        .catch(err => {
            console.log(err);
        });




}

exports.utility = (req, res) => {
    Utility.aggregate([{ $unwind: "$detail" }]).then(docs => {
        res.render('utilitybill', {
            mainpath: '/adduser',
            docs: docs

        })
    })



}
exports.utilityform = (req, res) => {
    var name = req.body.billto.toLowerCase()
    Utility.findOne({ name: name }).then(docs => {
        if (docs) {
            docs.updateOne({
                    $push: {
                        "detail": {
                            date: req.body.date,
                            payment: req.body.payment,
                            amount: req.body.amount

                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    console.log(err);
                    res.redirect('/utility')
                }
            )
        } else {
            var utility = new Utility({
                name: name,
                detail: [{
                    date: req.body.date,
                    payment: req.body.payment,
                    amount: req.body.amount
                }]

            })
            utility.save((err, docs) => {
                res.redirect('/utility')
            })

        }

    }).catch(err => {
        console.log(err)
    })



}