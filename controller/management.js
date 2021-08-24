require('../model/accountsmodal')
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
var fs = require('fs');
const Sellers = mongoose.model('Sellers');
const Users = mongoose.model('Users');
const Buyers = mongoose.model('Buyers');
const Sellerpayment = mongoose.model('Sellerpayment');
const Transaction = mongoose.model('Transaction');
const Buyerspayment = mongoose.model('Buyerspayment');
const Names = mongoose.model('Names');
const Utility = mongoose.model('Utility');
const generateUniqueId = require('generate-unique-id');




exports.accountmanagement = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    var start = new Date()
    var end = new Date()
    end.setDate(end.getDate() + 1)
    start.setMonth(start.getMonth() - 1);
    Buyers.aggregate([{ $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        },


    ]).then(data => {
        Sellers.aggregate([{ $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            },

        }]).then(datas => {
            Names.find().then(names => {
                res.render('accountmanagement', {
                    mainpath: '/stockmanagement',
                    subpath: '',
                    buyer: data,
                    seller: datas,
                    start: start,
                    end: end,
                    names: names,
                    errorMessage: message
                })
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));

}



exports.filtrsales = (req, res) => {

    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
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
        (start)

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
            Names.find().then(names => {
                res.render('accountmanagement', {
                    mainpath: '/stockmanagement',
                    subpath: '',
                    buyer: data,
                    seller: datas,
                    start: start,
                    end: end,
                    names: names,
                    errorMessage: message
                })
            }).catch(err => console.log(err));

        }).catch(err => console.log(err));
    }).catch(err => console.log(err));

}
exports.postdetailedbuyerdata = (req, res) => {
    const objectid = generateUniqueId({
        length: 25,
        useLetters: true
    });
    const arrayid = generateUniqueId({
        length: 25,
        useLetters: true
    });

    var name = req.body.buyer.toUpperCase();

    Sellers.findOne({ name: name }).then((docs, err) => {

        if (err) {
            console.log(err)
        }
        if (docs) {
            docs.updateOne({
                    $push: {
                        "deal": {
                            id: arrayid,
                            date: req.body.date,
                            bags: req.body.bags,
                            kilogram: req.body.kilogram,
                            price: req.body.price,
                            total: parseInt(req.body.price * req.body.kilogram),

                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {


                    Sellerpayment.findOne({ name: name }).then(docs => {
                        if (!docs) {

                        } else {

                            docs.total = parseInt(docs.total) + parseInt(req.body.remaining)
                            if (req.body.paid && req.body.paid != 0) {
                                docs.updateOne({
                                        $push: {

                                            "paid": {
                                                id: arrayid,
                                                date: req.body.date,
                                                amount: req.body.paid,
                                                agent: "not defined",
                                                typee: "bank",
                                                message: req.body.bags + "bags",
                                                remaining: parseInt(req.body.price * req.body.kilogram) - parseInt(req.body.paid),
                                            }

                                        },

                                    }, { safe: true, upsert: true },
                                    function(err, model) {

                                    }
                                )
                            }
                            docs.updateOne({

                                    $push: {
                                        "payment": {
                                            id: arrayid,
                                            date: req.body.date,
                                            amount: req.body.price * req.body.kilogram,
                                            agent: "not defined",
                                            typee: "bank",
                                            message: req.body.bags + "bags",
                                            remaining: parseInt(req.body.price * req.body.kilogram) - parseInt(req.body.paid),

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
                id: objectid,
                name: name,
                deal: [{
                    id: arrayid,
                    date: req.body.date,
                    bags: req.body.bags,
                    kilogram: req.body.kilogram,
                    price: req.body.price,
                    total: parseInt(req.body.price * req.body.kilogram),

                }]

            })
            sellers.save(function(err, doc) {
                var sellerpayment = new Sellerpayment({
                    id: objectid,
                    name: name,
                    total: doc.deal[0].remaining,

                    paid: [{
                        id: arrayid,
                        date: req.body.date,
                        amount: req.body.paid,
                        agent: "not defined",
                        typee: "bank",
                        message: req.body.bags + "bags",
                        remaining: parseInt(req.body.price * req.body.kilogram) - parseInt(req.body.paid),

                    }],
                    payment: [{
                        id: arrayid,
                        date: req.body.date,
                        amount: req.body.price * req.body.kilogram,
                        agent: "not defined",
                        typee: "purchase",
                        message: req.body.bags + "bags",
                        remaining: parseInt(req.body.price * req.body.kilogram) - parseInt(req.body.paid),
                    }]
                })

                sellerpayment.save(function(err, docs) {
                    if (err) {
                        console.log(err);

                    }


                })
            })
            Names.findOne({ $and: [{ name: name }, { relation: "seller" }] }).then(docs => {
                if (docs) {

                } else {
                    var names = new Names({

                        name: name,
                        relation: "seller",
                    })
                    names.save((err, docs) => {
                        if (err) {
                            console.log(err);

                        }
                    })
                }
            })

        }
    }).then((err, docs) => {
        if (err) console.log(err)
        var paymentmode
        if (req.body.paymentmode) {
            paymentmode = req.body.paymentmode;
        } else {
            paymentmode = "bank";
        }

        if (req.body.paid > 0) {

            var transaction = new Transaction({
                id: arrayid,
                Date: req.body.date,
                amount: req.body.paid,
                types: "debit",
                comment: "Amount paid to " + name,
                paymentmode: paymentmode,
                debit: req.body.paid

            })
            transaction.save((err, doc) => {


            })
        }
        if (req.body.type == "seperate") {
            req.flash('error', "Recent marked payment is = " + req.body.paid)
            res.redirect('/purchasemanagement')
        } else {
            req.flash('error', "Recent marked payment is = " + req.body.paid)
            res.redirect('/accountmanagement')

        }


    })



}
exports.deletepurchase = (req, res) => {
    var name
    Sellers.findOne({ id: req.params.objectid }, function(errs, datas) {

        name = datas.name
        if (errs) {
            res.send(errs);
        } else {
            datas.updateOne({
                    $pull: {
                        "deal": {
                            id: req.params.arrayid
                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    console.log(err);
                    Sellerpayment.findOne({ id: req.params.objectid }).then(docs => {
                        if (!docs) {

                        } else {
                            docs.updateOne({
                                    $pull: {
                                        "paid": {
                                            id: req.params.arrayid,

                                        }

                                    },

                                }, { safe: true, upsert: true },
                                function(err, model) {

                                }
                            )
                            docs.updateOne({

                                    $pull: {
                                        "payment": {
                                            id: req.params.arrayid,

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

        }
    }).then((err, docs) => {
        if (err) console.log(err)
        Transaction.findOneAndRemove({ id: req.params.arrayid }).then(docs => {
            if (req.params.type == "seperate") {
                res.redirect('/purchasemanagement')
            } else if (req.params.type == "nonseperate") {
                res.redirect('/accountmanagement')

            } else {
                res.redirect('/individualpurchase/' + name)
            }
        })

    })
};
exports.postbuyerform = (req, res) => {
    const objectid = generateUniqueId({
        length: 25,
        useLetters: true
    });
    const arrayid = generateUniqueId({
        length: 25,
        useLetters: true
    });

    var name = req.body.buyer.toUpperCase();
    console.log(name)
    Buyers.findOne({ name: name }).then(docs => {
        if (docs) {

            docs.updateOne({
                    $push: {
                        "deal": {
                            id: arrayid,
                            date: req.body.date,
                            bags: req.body.bags,
                            kilogram: req.body.kilogram,
                            price: req.body.price,
                            total: parseInt(req.body.price * req.body.kilogram),

                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    console.log(err);
                    Buyerspayment.findOne({ name: name }).then(docs => {
                        if (!docs) {

                        } else {

                            docs.total = parseInt(docs.total) + parseInt(req.body.remaining)
                            if (req.body.paid && req.body.paid != 0) {
                                docs.updateOne({
                                        $push: {
                                            "paid": {
                                                id: arrayid,
                                                date: req.body.date,
                                                amount: req.body.paid,
                                                agent: "not defined",
                                                typee: "bank",
                                                message: req.body.bags + "bags",
                                                remaining: parseInt(req.body.price * req.body.kilogram) - parseInt(req.body.paid),
                                            }

                                        },

                                    }, { safe: true, upsert: true },
                                    function(err, model) {

                                    }
                                )
                            }
                            docs.updateOne({

                                    $push: {
                                        "payment": {

                                            id: arrayid,
                                            date: req.body.date,
                                            amount: req.body.price * req.body.kilogram,
                                            agent: "not defined",
                                            typee: "bank",
                                            message: doc.deal[0].bags + " bags",
                                            remaining: parseInt(req.body.price * req.body.kilogram) - parseInt(req.body.paid),

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
                id: objectid,
                name: name,
                deal: [{
                    id: arrayid,
                    date: req.body.date,
                    bags: req.body.bags,
                    kilogram: req.body.kilogram,
                    price: req.body.price,
                    total: parseInt(req.body.price * req.body.kilogram),


                }]

            })


            buyers.save(function(err, doc) {

                var buyerspayment = new Buyerspayment({
                    id: objectid,
                    name: name,
                    total: doc.deal[0].remaining,
                    paid: [{
                        id: arrayid,
                        date: req.body.date,
                        amount: req.body.paid,
                        agent: "not defined",
                        typee: "bank",
                        message: req.body.bags + "bags",
                        remaining: parseInt(req.body.price * req.body.kilogram) - parseInt(req.body.paid),

                    }],
                    payment: [{
                        id: arrayid,
                        date: req.body.date,
                        amount: req.body.price * req.body.kilogram,
                        agent: "not defined",
                        typee: "bank",
                        message: doc.deal[0].bags + " bags",
                        remaining: parseInt(req.body.price * req.body.kilogram) - parseInt(req.body.paid),

                    }]
                })

                buyerspayment.save(function(err, docs) {
                    if (err) {
                        console.log(err);

                    }

                })

            })
            Names.findOne({ $and: [{ name: name }, { relation: "buyer" }] }).then(docs => {
                if (docs) {

                } else {
                    var names = new Names({

                        name: name,
                        relation: "buyer",
                    })
                    names.save((err, docs) => {
                        if (err) {
                            console.log(err);

                        }
                    })
                }
            })

        }
    }).then(docs => {
        var paymentmode
        if (req.body.paymentmode) {
            paymentmode = req.body.paymentmode;
        } else {
            paymentmode = "bank";
        }

        if (req.body.paid > 0) {
            var transaction = new Transaction({
                id: arrayid,
                Date: req.body.date,
                amount: req.body.paid,
                types: "credit",
                comment: "Amount recieved from " + name,
                paymentmode: paymentmode,
                credit: req.body.paid

            })
            transaction.save((err, doc) => {


            })
        }
        if (req.body.type == "seperate") {
            req.flash('error', "Recent marked payment is = " + req.body.paid)
            res.redirect('/salesmanagement')
        } else {
            req.flash('error', "Recent marked payment is = " + req.body.paid)
            res.redirect('/accountmanagement')
        }
    })






}
exports.deletesales = (req, res) => {
    var name
    Buyers.findOne({ id: req.params.objectid }, function(errs, datas) {

        name = datas.name
        if (errs) {
            res.send(errs);
        } else {
            datas.updateOne({
                    $pull: {
                        "deal": {
                            id: req.params.arrayid
                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    console.log(err);
                    Buyerspayment.findOne({ id: req.params.objectid }).then(docs => {
                        if (!docs) {

                        } else {
                            docs.updateOne({
                                    $pull: {
                                        "paid": {
                                            id: req.params.arrayid,

                                        }

                                    },

                                }, { safe: true, upsert: true },
                                function(err, model) {

                                }
                            )
                            docs.updateOne({

                                    $pull: {
                                        "payment": {
                                            id: req.params.arrayid,

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

        }
    }).then((err, docs) => {
        if (err) console.log(err)

        Transaction.findOneAndDelete({ id: req.params.arrayid }).then(docs => {
            if (err) console.log(err)
            if (req.params.type == "seperate") {
                res.redirect('/salesmanagement')
            } else if (req.params.type == "nonseperate") {
                res.redirect('/accountmanagement')

            } else {
                res.redirect('/individualsales/' + name)
            }
        })

    })
};

exports.salesmanagement = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    Buyers.aggregate([{ $unwind: "$deal" }]).then(datas => {
        Names.find({ relation: "buyer" }).then(names => {

            res.render('salesmanagement', {
                mainpath: '/stockmanagement',
                subpath: '',
                buyer: datas,
                names: names,
                errorMessage: message
            })
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));

}
exports.purchasemanagement = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    Sellers.aggregate([{ $unwind: "$deal" }]).then(datas => {
        Names.find({ relation: "seller" }).then(names => {

            res.render('purchasemanagement', {
                mainpath: '/stockmanagement',
                subpath: '',
                seller: datas,
                names: names,
                errorMessage: message
            })
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));

}
exports.individualaccounts = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    var start = new Date()
    var end = new Date()
    end.setDate(end.getDate() + 1)
    start.setMonth(start.getMonth() - 1);
    Sellerpayment.aggregate([
        { $unwind: "$payment" },
        {
            $match: {

                "payment.date": {
                    $lt: end,
                    $gte: start
                }
            }
        },
    ]).then(sellerpayment => {
        Sellerpayment.aggregate([{ $unwind: "$paid" },
            {
                $match: {

                    "paid.date": {
                        $lt: end,
                        $gte: start
                    }
                }
            },

        ]).then(sellerpaid => {
            Buyerspayment.aggregate([{ $unwind: "$payment" },
                {
                    $match: {

                        "payment.date": {
                            $lt: end,
                            $gte: start
                        }
                    }
                },

            ]).then(buyerpayment => {
                Buyerspayment.aggregate([{ $unwind: "$paid" },
                    {
                        $match: {

                            "paid.date": {
                                $lt: end,
                                $gte: start
                            }
                        }
                    },

                ]).then(buyerspaid => {
                    Names.find().then(names => {

                        res.render('individualaccounts', {
                            mainpath: '/accountmanagement',
                            subpath: '',
                            sellerpayment: sellerpayment,
                            sellerpaid: sellerpaid,
                            buyerpayment: buyerpayment,
                            buyerspaid: buyerspaid,
                            names: names,
                            errorMessage: message
                        })
                    })
                })
            })
        })

    })

}
exports.individualpurchase = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    Sellers.findOne({ name: req.params.id }).then(docs => {

        res.render('individualsalesandpurchase', {
            mainpath: '/stockmanagement',
            category: 'purchase',
            subpath: '',
            data: docs,
            errorMessage: message

        })

    }).catch(err => console.log(err));

}
exports.individualsales = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    Buyers.findOne({ name: req.params.id }).then(docs => {

        res.render('individualsalesandpurchase', {
            mainpath: '/stockmanagement',
            category: 'sales',
            subpath: '',
            data: docs,
            errorMessage: message

        })

    }).catch(err => console.log(err));

}
exports.updateindividualsales = (req, res) => {

    const arrayid = generateUniqueId({
        length: 25,
        useLetters: true
    });

    Buyers.findOne({ name: req.body.id }).then(docs => {
        if (docs) {

            docs.updateOne({

                    $push: {
                        "deal": {
                            id: arrayid,
                            date: req.body.date,
                            bags: req.body.bags,
                            kilogram: req.body.kilogram,
                            price: req.body.price,
                            total: parseInt(req.body.price * req.body.kilogram),

                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    console.log(err);

                }
            )
        }
    }).then(docs => {
        Buyerspayment.findOne({ name: req.body.id }).then(docs => {
            if (!docs) {

            } else {

                docs.total = parseInt(docs.total) + parseInt(req.body.remaining)
                if (req.body.paid && req.body.paid != 0) {
                    docs.updateOne({
                            $push: {
                                "paid": {
                                    id: arrayid,
                                    date: req.body.date,
                                    amount: req.body.paid,
                                    agent: "not defined",
                                    typee: "bank",
                                    message: req.body.bags + "bags",
                                    remaining: parseInt(req.body.price * req.body.kilogram) - parseInt(req.body.paid),
                                }

                            },

                        }, { safe: true, upsert: true },
                        function(err, model) {

                        }
                    )
                }
                docs.updateOne({

                        $push: {
                            "payment": {

                                id: arrayid,
                                date: req.body.date,
                                amount: req.body.price * req.body.kilogram,
                                agent: "not defined",
                                typee: "bank",
                                message: req.body.bags + " bags",
                                remaining: parseInt(req.body.price * req.body.kilogram) - parseInt(req.body.paid),

                            }
                        }
                    }, { safe: true, upsert: true },
                    function(err, model) {

                    }
                )
            }
        }).then(docs => {

            if (req.body.paid > 0) {
                var transaction = new Transaction({
                    id: arrayid,
                    Date: req.body.date,
                    amount: req.body.paid,
                    types: "credit",
                    comment: "Amount recieved from " + req.body.id,
                    paymentmode: "bank",
                    credit: req.body.paid

                })
                transaction.save((err, doc) => {


                })
                req.flash('error', "Recent marked payment is = " + req.body.paid)
                res.redirect('/individualsales/' + req.body.id)
            }
        })


    })

}
exports.updateindividualpuchase = (req, res) => {

    const arrayid = generateUniqueId({
        length: 25,
        useLetters: true
    });
    Sellers.findOne({ name: req.body.id }).then(docs => {
        if (docs) {

            docs.updateOne({
                    $push: {
                        "deal": {
                            id: arrayid,
                            date: req.body.date,
                            bags: req.body.bags,
                            kilogram: req.body.kilogram,
                            price: req.body.price,
                            total: parseInt(req.body.price * req.body.kilogram),

                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    console.log(err);

                }
            )
        }
    }).then(docs => {
        Sellerpayment.findOne({ name: req.body.id }).then(docs => {
            if (!docs) {

            } else {

                docs.total = parseInt(docs.total) + parseInt(req.body.remaining)
                if (req.body.paid && req.body.paid != 0) {
                    docs.updateOne({
                            $push: {
                                "paid": {
                                    id: arrayid,
                                    date: req.body.date,
                                    amount: req.body.paid,
                                    agent: "not defined",
                                    typee: "bank",
                                    message: req.body.bags + "bags",
                                    remaining: parseInt(req.body.price * req.body.kilogram) - parseInt(req.body.paid),
                                }

                            },

                        }, { safe: true, upsert: true },
                        function(err, model) {

                        }
                    )
                }
                docs.updateOne({

                        $push: {
                            "payment": {

                                id: arrayid,
                                date: req.body.date,
                                amount: req.body.price * req.body.kilogram,
                                agent: "not defined",
                                typee: "bank",
                                message: req.body.bags + " bags",
                                remaining: parseInt(req.body.price * req.body.kilogram) - parseInt(req.body.paid),

                            }
                        }
                    }, { safe: true, upsert: true },
                    function(err, model) {

                    }
                )
            }
        }).then(docs => {

            if (req.body.paid > 0) {
                var transaction = new Transaction({
                    id: arrayid,
                    Date: req.body.date,
                    amount: req.body.paid,
                    types: "credit",
                    comment: "Amount recieved from " + req.body.id,
                    paymentmode: "bank",
                    credit: req.body.paid

                })
                transaction.save((err, doc) => {


                })
                req.flash('error', "Recent marked payment is = " + req.body.paid)
                res.redirect('/individualpurchase/' + req.body.id)
            }
        })



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
    var name = req.body.name.toUpperCase()
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
    var name = req.body.billto.toUpperCase()
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

exports.editorder = (req, res) => {

    if (req.body.section == "sales") {

        var name
        Buyers.findOne({ id: req.body.objectid }).then(docs => {
            name = docs.name
            Buyers.findOneAndUpdate({ id: req.body.objectid, deal: { $elemMatch: { id: req.body.arrayid } } }, {

                        $set: {

                            'deal.$.date': req.body.editdate,
                            'deal.$.bags': req.body.editbags,
                            'deal.$.kilogram': req.body.editkilogram,
                            'deal.$.price': req.body.editprize,
                            'deal.$.total': parseInt(req.body.editprize * req.body.editkilogram),
                            'deal.$.outumn': req.body.autumn,
                            'deal.$.moisture': req.body.moisture,
                            'deal.$.careoff': req.body.Careoff,


                        }
                    }, // list fields you like to change
                    { 'new': true, 'safe': true, 'upsert': true })
                .then(docs => {
                    if (req.body.types == "seperate") {
                        req.flash('error', "Please edit the accounts of ecent editted deal")
                        res.redirect('/salesmanagement')

                    } else if (req.body.types == "detailedsalesandpurchase") {
                        req.flash('error', "Please edit the accounts of ecent editted deal")
                        res.redirect('/accountmanagement')

                    } else {
                        req.flash('error', "Please edit the accounts of ecent editted deal")
                        res.redirect('/individualsales/' + name)
                            // res.redirect('/individualsales/' + name)
                    }
                })
        })

    } else {

        var name
        Sellers.findOne({ id: req.body.objectid }).then(docs => {
            name = docs.name

            Sellers.findOneAndUpdate({ id: req.body.objectid, deal: { $elemMatch: { id: req.body.arrayid } } }, {

                        $set: {

                            'deal.$.date': req.body.editdate,
                            'deal.$.bags': req.body.editbags,
                            'deal.$.kilogram': req.body.editkilogram,
                            'deal.$.price': req.body.editprize,
                            'deal.$.total': parseInt(req.body.editprize * req.body.editkilogram),
                            'deal.$.outumn': req.body.autumn,
                            'deal.$.moisture': req.body.moisture,
                            'deal.$.careoff': req.body.Careoff,


                        }
                    }, // list fields you like to change
                    { 'new': true, 'safe': true, 'upsert': true })
                .then(docs => {
                    if (req.body.types == "seperate") {
                        req.flash('error', "Please edit the accounts of ecent editted deal")
                        res.redirect('/purchasemanagement')
                    } else if (req.body.types == "detailedsalesandpurchase") {
                        req.flash('error', "Please edit the accounts of ecent editted deal")
                        res.redirect('/accountmanagement')

                    } else {
                        req.flash('error', "Please edit the accounts of ecent editted deal")
                        res.redirect('/individualpurchase/' + name)
                            // res.redirect('/individualsales/' + name)
                    }
                })
        })


    }
}
exports.getTransaction = (req, res) => {
    var start = new Date()
    var end = new Date()
    end.setDate(end.getDate() + 1)
    start.setMonth(start.getMonth() - 1);
    Transaction.find({ //query today up to tonight
        Date: {
            $lt: end,
            $gte: start
        }
    }).then(docs => {

        res.render('transactions', {
            mainpath: '/transaction',
            data: docs,
            start: start,
            end: end

        })
    })


}

exports.purchasepayment = (req, res) => {
    const uid = generateUniqueId({
        length: 25,
        useLetters: true
    });
    var name = req.body.name.toUpperCase()
    Sellerpayment.findOne({ name: name }).then(docs => {
        console.log(docs)
        if (!docs) {

        } else {


            var total = docs.total - req.body.amount;
            docs.updateOne({
                    "total": total,
                    $push: {
                        "paid": {
                            id: uid,
                            date: req.body.date,
                            amount: req.body.amount,
                            agent: req.body.agent,
                            typee: req.body.through,
                            message: "",
                            remaining: total
                        }

                    },

                }, { safe: true, upsert: true },
                function(err, model) {
                    var transaction = new Transaction({
                        id: uid,
                        Date: req.body.date,
                        amount: req.body.amount,
                        types: "debit",
                        comment: "Payment updation to " + name,
                        paymentmode: req.body.through,
                        debit: req.body.amount,

                    })
                    transaction.save((err, doc) => {


                    })
                }
            )
        }
    })

    if (req.body.types == "seperate") {
        res.redirect('/purchaseaccount')
    } else {
        res.redirect('/individualaccounts')

    }
}
exports.salespayment = (req, res) => {
    const uid = generateUniqueId({
        length: 25,
        useLetters: true
    });
    var name = req.body.name.toUpperCase()
    Buyerspayment.findOne({ name: name }).then(docs => {

        if (!docs) {
            if (req.body.types == "seperate") {
                return res.redirect('/salesaccount')
            } else {
                return res.redirect('/individualaccounts')

            }
        } else {

            var total = docs.total - req.body.amount;
            docs.updateOne({
                    "total": total,

                    $push: {
                        "paid": {
                            id: uid,
                            date: req.body.date,
                            amount: req.body.amount,
                            agent: req.body.agent,
                            typee: req.body.through,
                            message: "",
                            remaining: total
                        }

                    },

                }, { safe: true, upsert: true },
                function(err, model) {
                    var transaction = new Transaction({
                        id: uid,
                        Date: req.body.date,
                        amount: req.body.amount,
                        types: "credit",
                        comment: "Payment updation to " + name,
                        paymentmode: req.body.through,
                        credit: req.body.amount,

                    })
                    transaction.save((err, doc) => {


                    })
                }
            )
        }
    })

    if (req.body.types == "seperate") {
        res.redirect('/salesaccount')
    } else {
        res.redirect('/individualaccounts')

    }
}
exports.getsalesaccount = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    Buyerspayment.aggregate([{ $unwind: "$paid" }]).then(buyerspaid => {
        Buyerspayment.aggregate([{ $unwind: "$payment" }]).then(buyerpayment => {

            Names.find({ relation: "buyer" }).then(names => {

                res.render('salesaccount', {
                    mainpath: '/accountmanagement',
                    subpath: '',
                    errorMessage: message,
                    names: names,
                    buyerpayment: buyerpayment,
                    buyerspaid: buyerspaid,
                })
            })
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));

}
exports.getpurchaseaccount = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    Sellerpayment.aggregate([{ $unwind: "$paid" }]).then(sellerpaid => {
        Sellerpayment.aggregate([{ $unwind: "$payment" }]).then(sellerpayment => {
            Names.find({ relation: "seller" }).then(names => {

                res.render('purchaseaccount', {
                    mainpath: '/accountmanagement',
                    subpath: '',
                    errorMessage: message,
                    names: names,
                    sellerpayment: sellerpayment,
                    sellerpaid: sellerpaid,

                })
            })
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));

}
exports.individualpurchaseaccount = (req, res) => {
    Sellerpayment.aggregate([{
        $match: { name: req.params.id }
    }, { $unwind: "$paid" }]).then(sellerpaid => {
        Sellerpayment.aggregate([{
            $match: { name: req.params.id }
        }, { $unwind: "$payment" }]).then(sellerpayment => {
            Names.find().then(names => {
                res.render('individualsalespurchaseaccout', {
                    mainpath: '/accountmanagement',
                    paid: sellerpaid,
                    payment: sellerpayment,
                    mode: "purchase",
                    names: names
                })
            })
        })

    }).catch(err => console.log(err));

}
exports.individualsalesaccount = (req, res) => {
    Buyerspayment.aggregate([{
        $match: { name: req.params.id }
    }, { $unwind: "$paid" }]).then(buyerpaid => {
        Buyerspayment.aggregate([{
            $match: { name: req.params.id }
        }, { $unwind: "$payment" }]).then(buyerpayment => {
            Names.find().then(names => {
                res.render('individualsalespurchaseaccout', {
                    mainpath: '/accountmanagement',
                    paid: buyerpaid,
                    payment: buyerpayment,
                    mode: "sales",
                    names: names
                })
            })
        })

    }).catch(err => console.log(err));


}
exports.editaccount = (req, res) => {

    if (req.body.section == "sales") {
        if (req.body.mode == "paid") {
            var name
            Buyerspayment.findOne({ id: req.body.objectid }).then(docs => {
                name = docs.name
                Buyerspayment.findOneAndUpdate({ id: req.body.objectid, paid: { $elemMatch: { id: req.body.arrayid } } }, {

                            $set: {
                                'total': parseInt(req.body.totalrem - req.body.previous) + parseInt(req.body.amount),
                                'paid.$.date': req.body.editdate,
                                'paid.$.message': req.body.order,
                                'paid.$.amount': req.body.amount,
                                'paid.$.agent': req.body.Careoff,
                                'paid.$.typee': req.body.through,
                                'paid.$.remaining': parseInt(req.body.totalrem - req.body.previous) + parseInt(req.body.amount),


                            }
                        }, // list fields you like to change
                        { 'new': true, 'safe': true, 'upsert': true })
                    .then(docs => {
                        Transaction.findOneAndUpdate({ id: req.body.arrayid }).then(docs => {
                            if (docs) {
                                docs.Date = req.body.editdate;
                                docs.amount = req.body.amount;
                                docs.comment = req.body.order;
                                docs.credit = req.body.amount;
                                docs.paymentmod = req.body.through;

                                docs.save()
                            }
                        }).then(docs => {
                            if (req.body.types == "seperate") {
                                res.redirect('/salespayment')
                            } else if (req.body.types == "purchasesalesaccount") {
                                res.redirect('/individualaccounts')

                            } else {
                                res.redirect('/individualsalesaccount/' + name)
                                    // res.redirect('/individualsales/' + name)
                            }
                        })

                    })
            })
        } else {
            Buyerspayment.findOne({ id: req.body.objectid }).then(docs => {
                name = docs.name
                Buyerspayment.findOneAndUpdate({ id: req.body.objectid, payment: { $elemMatch: { id: req.body.arrayid } } }, {

                            $set: {
                                'total': parseInt(req.body.totalrem - req.body.previous) + parseInt(req.body.amount),
                                'payment.$.date': req.body.editdate,
                                'payment.$.message': req.body.order,
                                'payment.$.amount': req.body.amount,
                                'payment.$.agent': req.body.Careoff,
                                'payment.$.typee': req.body.through,
                                'payment.$.remaining': parseInt(req.body.totalrem - req.body.previous) + parseInt(req.body.amount),


                            }
                        }, // list fields you like to change
                        { 'new': true, 'safe': true, 'upsert': true })
                    .then(docs => {
                        if (req.body.types == "seperate") {
                            res.redirect('/salespayment')
                        } else if (req.body.types == "purchasesalesaccount") {
                            res.redirect('/individualaccounts')

                        } else {
                            res.redirect('/individualsalesaccount/' + name)
                                // res.redirect('/individualsales/' + name)
                        }
                    })
            })
        }

    } else {

        if (req.body.mode == "paid") {

            var name
            Sellerpayment.findOne({ id: req.body.objectid }).then(docs => {
                name = docs.name
                Sellerpayment.findOneAndUpdate({ id: req.body.objectid, paid: { $elemMatch: { id: req.body.arrayid } } }, {

                            $set: {

                                'total': parseInt(req.body.totalrem - req.body.previous) + parseInt(req.body.amount),
                                'paid.$.date': req.body.editdate,
                                'paid.$.message': req.body.order,
                                'paid.$.amount': req.body.amount,
                                'paid.$.agent': req.body.Careoff,
                                'paid.$.typee': req.body.through,
                                'paid.$.remaining': parseInt(req.body.totalrem - req.body.previous) + parseInt(req.body.amount),


                            }
                        }, // list fields you like to change
                        { 'new': true, 'safe': true, 'upsert': true })
                    .then(docs => {
                        Transaction.findOneAndUpdate({ id: req.body.arrayid }).then(docs => {
                            if (docs) {
                                docs.Date = req.body.editdate;
                                docs.amount = req.body.amount;
                                docs.comment = req.body.order;
                                docs.debit = req.body.amount;
                                docs.paymentmod = req.body.through;

                                docs.save()
                            }
                        }).then(docs => {
                            if (req.body.types == "seperate") {
                                res.redirect('/purchaseaccount')
                            } else if (req.body.types == "purchasesalesaccount") {
                                res.redirect('/individualaccounts')

                            } else {
                                res.redirect('/individualpurchaseaccount/' + name)
                                    // res.redirect('/individualsales/' + name)
                            }
                        })

                    })
            })
        } else {
            Sellerpayment.findOne({ id: req.body.objectid }).then(docs => {
                name = docs.name
                Sellerpayment.findOneAndUpdate({ id: req.body.objectid, payment: { $elemMatch: { id: req.body.arrayid } } }, {

                            $set: {
                                'total': parseInt(req.body.totalrem - req.body.previous) + parseInt(req.body.amount),
                                'payment.$.date': req.body.editdate,
                                'payment.$.message': req.body.order,
                                'payment.$.amount': req.body.amount,
                                'payment.$.agent': req.body.Careoff,
                                'payment.$.typee': req.body.through,
                                'payment.$.remaining': parseInt(req.body.totalrem - req.body.previous) + parseInt(req.body.amount),

                            }
                        }, // list fields you like to change
                        { 'new': true, 'safe': true, 'upsert': true })
                    .then(docs => {

                        if (req.body.types == "seperate") {
                            res.redirect('/purchaseaccount')
                        } else if (req.body.types == "purchasesalesaccount") {
                            res.redirect('/individualaccounts')

                        } else {
                            res.redirect('/individualpurchaseaccount/' + name)
                                // res.redirect('/individualsales/' + name)
                        }
                    })
            })
        }

    }
}
exports.deletepurchaseaccount = (req, res) => {
    var name
    if (req.params.method == "paid") {


        Sellerpayment.findOne({ id: req.params.objectid }).then(docs => {
            name = docs.name
            if (!docs) {

            } else {

                docs.updateOne({
                        $pull: {
                            "paid": {
                                id: req.params.arrayid,

                            }

                        },

                    }, { safe: true, upsert: true },
                    function(err, model) {

                    }
                )

            }
        }).then((err, docs) => {
                if (err) console.log(err)
                Transaction.findOneAndRemove({ id: req.params.arrayid }).then(docs => {
                    if (req.params.type == "seperate") {
                        res.redirect('/purchaseaccount')
                    } else if (req.params.type == "nonseperate") {
                        res.redirect('/individualaccounts')

                    } else {
                        res.redirect('/individualpurchaseaccount/' + name)
                    }
                })


            }

        )
    } else {
        Sellerpayment.findOne({ id: req.params.objectid }).then(docs => {
            name = docs.name
            if (!docs) {

            } else {

                docs.updateOne({
                        $pull: {
                            "payment": {
                                id: req.params.arrayid,

                            }

                        },

                    }, { safe: true, upsert: true },
                    function(err, model) {

                    }
                )

            }
        }).then((err, docs) => {
                if (err) console.log(err)
                Transaction.findOneAndRemove({ id: req.params.arrayid }).then(docs => {
                    if (req.params.type == "seperate") {
                        res.redirect('/purchaseaccount')
                    } else if (req.params.type == "nonseperate") {
                        res.redirect('/individualaccounts')

                    } else {
                        res.redirect('/individualpurchaseaccount/' + name)
                    }
                })


            }

        )
    }

};

exports.deletesalesaccount = (req, res) => {
    if (req.params.method == "paid") {
        var name

        Buyerspayment.findOne({ id: req.params.objectid }).then(docs => {
            if (!docs) {

            } else {
                name = docs.name
                docs.updateOne({
                        $pull: {
                            "paid": {
                                id: req.params.arrayid,

                            }

                        },

                    }, { safe: true, upsert: true },
                    function(err, model) {

                    }
                )

            }
        }).then((err, docs) => {
                if (err) console.log(err)
                Transaction.findOneAndRemove({ id: req.params.arrayid }).then(docs => {
                    if (req.params.type == "seperate") {
                        res.redirect('/salesaccount')
                    } else if (req.params.type == "nonseperate") {
                        res.redirect('/individualaccounts')

                    } else {
                        res.redirect('/individualsalesaccount/' + name)
                    }
                })


            }

        )
    } else {
        Buyerspayment.findOne({ id: req.params.objectid }).then(docs => {
            if (!docs) {

            } else {
                name = docs.name
                docs.updateOne({
                        $pull: {
                            "payment": {
                                id: req.params.arrayid,

                            }

                        },

                    }, { safe: true, upsert: true },
                    function(err, model) {

                    }
                )

            }
        }).then((err, docs) => {

                if (err) console.log(err)
                Transaction.findOneAndRemove({ id: req.params.arrayid }).then(docs => {
                    if (req.params.type == "seperate") {
                        res.redirect('/salesaccount')
                    } else if (req.params.type == "nonseperate") {
                        res.redirect('/individualaccounts')

                    } else {
                        res.redirect('/individualsalesaccount/' + name)
                    }
                })


            }

        )
    }

};
exports.credittransaction = (req, res) => {

    var transaction = new Transaction({

        Date: req.body.date,
        amount: req.body.amount,
        types: "credit",
        comment: req.body.hint,
        paymentmode: req.body.through,
        credit: req.body.amount,
        mode: "added"

    })
    transaction.save((err, doc) => {
        res.redirect('/transaction')

    })
}
exports.debittransaction = (req, res) => {
    var transaction = new Transaction({
        Date: req.body.date,
        amount: req.body.amount,
        types: "debit",
        comment: req.body.hint,
        paymentmode: req.body.through,
        debit: req.body.amount,
        mode: "added"

    })
    transaction.save((err, doc) => {

        res.redirect('/transaction')
    })

}
exports.editcredittransaction = (req, res) => {
    Transaction.findByIdAndUpdate(req.body.objectid).then(doc => {
        if (!doc) {
            res.send(err)
        } else {
            doc.date = req.body.editdate;
            doc.amount = req.body.amount;
            doc.credit = req.body.amount;
            doc.comment = req.body.hint;
            doc.paymentmode = req.body.through;
            doc.save()
        }
    }).then(doc => {

        res.redirect('/transaction')

    })
}
exports.editdebittransaction = (req, res) => {
    Transaction.findByIdAndUpdate(req.body.objectid).then(doc => {
        if (!doc) {
            res.send(err)
        } else {
            doc.date = req.body.editdate;
            doc.amount = req.body.amount;
            doc.debit = req.body.amount;
            doc.comment = req.body.hint;
            doc.paymentmode = req.body.through;
            doc.save()
        }
    }).then(doc => {

        res.redirect('/transaction')

    })

}
exports.deletetransaction = (req, res) => {
    Transaction.findByIdAndDelete(req.params.id).then((err, docs) => {

        res.redirect('/transaction')

    })

}
exports.filterTransaction = (req, res) => {


    var end = new Date()
    var start = new Date()


    if (req.body.type == 'filter') {

        start = new Date(req.body.sdate);
        end = new Date(req.body.edate);

    } else if (req.body.type == '2months') {
        start.setMonth(start.getMonth() - 2);

    } else if (req.body.type == '5months') {
        start.setMonth(start.getMonth() - 5);


    } else if (req.body.type == 'year') {
        start.setFullYear(start.getFullYear() - 1);

    } else {
        start = new Date(08 / 03 / 2000)


    }

    Transaction.find({ //query today up to tonight
        Date: {
            $lt: end,
            $gte: start
        }
    }).then(docs => {

        res.render('transactions', {
            mainpath: '/transaction',
            data: docs,
            start: start,
            end: end

        })
    })

}
exports.individualpurchasepayment = (req, res) => {
    const uid = generateUniqueId({
        length: 25,
        useLetters: true
    });
    var name = req.body.name.toUpperCase()
    if (req.body.type == "paid") {

        Sellerpayment.findOne({ name: name }).then(docs => {

            if (!docs) {

            } else {


                var total = docs.total - req.body.amount;
                docs.updateOne({
                        "total": total,
                        $push: {
                            "paid": {
                                id: uid,
                                date: req.body.date,
                                amount: req.body.amount,
                                agent: req.body.agent,
                                typee: req.body.through,
                                message: "amount paid",
                                remaining: total
                            }

                        },

                    }, { safe: true, upsert: true },
                    function(err, model) {
                        var transaction = new Transaction({
                            id: uid,
                            Date: req.body.date,
                            amount: req.body.amount,
                            types: "debit",
                            comment: "Payment to " + name,
                            paymentmode: req.body.through,
                            debit: req.body.amount,

                        })
                        transaction.save((err, doc) => {


                        })
                    }
                )
            }
        })
    } else {
        Sellerpayment.findOne({ name: name }).then(docs => {

            if (!docs) {

            } else {


                var total = docs.total + req.body.amount;
                docs.updateOne({
                        "total": total,
                        $push: {
                            "payment": {
                                id: uid,
                                date: req.body.date,
                                amount: req.body.amount,
                                agent: req.body.agent,
                                typee: req.body.through,
                                message: "new payment",
                                remaining: total
                            }

                        },

                    }, { safe: true, upsert: true },
                    function(err, model) {

                    }
                )
            }
        })
    }


    return res.redirect('/individualpurchaseaccount/' + name)


}
exports.inividualsalespayment = (req, res) => {
    const uid = generateUniqueId({
        length: 25,
        useLetters: true
    });
    var name = req.body.name.toUpperCase()
    if (req.body.type == "paid") {

        Buyerspayment.findOne({ name: name }).then(docs => {
            console.log(docs)
            if (!docs) {

            } else {


                var total = docs.total - req.body.amount;
                docs.updateOne({
                        "total": total,
                        $push: {
                            "paid": {
                                id: uid,
                                date: req.body.date,
                                amount: req.body.amount,
                                agent: req.body.agent,
                                typee: req.body.through,
                                message: "amount paid",
                                remaining: total
                            }

                        },

                    }, { safe: true, upsert: true },
                    function(err, model) {
                        var transaction = new Transaction({
                            id: uid,
                            Date: req.body.date,
                            amount: req.body.amount,
                            types: "credit",
                            comment: "Payment to " + name,
                            paymentmode: req.body.through,
                            credit: req.body.amount,

                        })
                        transaction.save((err, doc) => {


                        })
                    }
                )
            }
        })
    } else {
        Buyerspayment.findOne({ name: name }).then(docs => {

            if (!docs) {

            } else {


                var total = docs.total + req.body.amount;
                docs.updateOne({
                        "total": total,
                        $push: {
                            "payment": {
                                id: uid,
                                date: req.body.date,
                                amount: req.body.amount,
                                agent: req.body.agent,
                                typee: req.body.through,
                                message: "new payment",
                                remaining: total
                            }

                        },

                    }, { safe: true, upsert: true },
                    function(err, model) {

                    }
                )
            }
        })
    }


    return res.redirect('/individualsalesaccount/' + name)


}