require('../model/accountsmodal')
require('../model/employeemodel')
const mongoose = require('mongoose');
const Utility = mongoose.model('Utility');
var fs = require('fs');
const Transaction = mongoose.model('Transaction');
const Loaders = mongoose.model('Loaders');
const Lorirent = mongoose.model('Lorirent');
const Payments = mongoose.model('Payments');
exports.addlorirent = (req, res) => {
    let payment = req.flash('payment');
    if (payment.length > 0) {
        payment = payment[0];
    } else {
        payment = false;
    }
    var start = new Date()
    var end = new Date()
    end.setDate(end.getDate() + 1)
    start.setMonth(start.getMonth() - 1);
    Lorirent.aggregate([{ $unwind: "$trips" }, {
        $match: {

            "trips.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "trips.date": -1, "trips._id": -1 }).exec((err, docs) => {
        Lorirent.aggregate([{ $unwind: "$paid" }, {
            $match: {

                "paid.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]).sort({ "paid.date": -1, "paid._id": -1 }).exec((err, dics) => {
            Lorirent.find().distinct('registration').then(loari => {

                res.render('addlorirent', {
                    mainpath: '/addlorirent',
                    docs: docs,
                    loari: loari,
                    start: start,
                    end: end,
                    individual: false,
                    dics: dics,
                    payment: payment

                })
            })
        })
    })



}
exports.postaddlorirent = (req, res) => {

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
                            monitor: req.session.user.name

                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    if (req.body.type == 'individual') {
                        req.flash('payment', false)
                        res.redirect('/addindividuallorirent/' + number)
                    } else {
                        req.flash('payment', false)
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
                    monitor: req.session.user.name
                }],
            })
            lorirent.save((err, docs) => {
                if (err) console.log(err)
                if (req.body.type == 'individual') {
                    req.flash('payment', false)
                    res.redirect('/addindividuallorirent/' + number)
                } else {
                    req.flash('payment', false)
                    res.redirect('/addlorirent')
                }
            })
        }
    }).catch(err => {

        console.log(err)
    })



}
exports.addloripayment = (req, res) => {
    const arrayid = new mongoose.Types.ObjectId()
    var number = req.body.loari.toUpperCase()
    Lorirent.findOne({ registration: number }).then(docs => {
        if (docs) {
            docs.updateOne({
                    $push: {
                        "paid": {
                            _id: arrayid,
                            date: req.body.date,
                            amount: req.body.amount,
                            hint: req.body.hint,


                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {


                })
        } else {
            var lorirent = new Lorirent({

                registration: number,
                paid: [{
                    _id: arrayid,
                    date: req.body.date,
                    amount: req.body.amount,
                    hint: req.body.hint,
                }],
            })
            lorirent.save((err, docs) => {})
        }
    }).then(doc => {
        var transaction = new Transaction({
            _id: arrayid,
            Date: req.body.date,
            amount: req.body.amount,
            types: "debit",
            comment: "Rent To. " + number,
            paymentmode: req.body.hint,
            debit: req.body.paid,
            section: "lori rent"

        })
        transaction.save((err, doc) => {
            if (req.body.type == 'individual') {
                req.flash('payment', true)
                res.redirect('/addindividuallorirent/' + number)
            } else {
                req.flash('payment', true)
                res.redirect('/addlorirent')
            }
        })

    })



}
exports.fliteraddlorirent = (req, res) => {
    let payment = req.flash('payment');
    if (payment.length > 0) {
        payment = payment[0];
    } else {
        payment = false;
    }
    start = new Date(req.body.sdate);
    end = new Date(req.body.edate);

    Lorirent.aggregate([{ $unwind: "$trips" }, {
        $match: {

            "trips.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "trips.date": -1, "trips._id": -1 }).exec((err, docs) => {
        Lorirent.aggregate([{ $unwind: "$paid" }, {
            $match: {

                "paid.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]).sort({ "paid.date": -1, "paid._id": -1 }).exec((err, dics) => {
            Lorirent.find().distinct('registration').then(loari => {

                res.render('addlorirent', {
                    mainpath: '/addlorirent',
                    docs: docs,
                    loari: loari,
                    start: start,
                    end: end,
                    individual: false,
                    dics: dics,
                    payment: payment

                })
            })
        })
    })



}

exports.addindividuallorirent = (req, res) => {
    let payment = req.flash('payment');
    if (payment.length > 0) {
        payment = payment[0];
    } else {
        payment = false;
    }
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
    }, { $unwind: "$trips" }, {
        $match: {

            "trips.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "trips.date": -1, "trips._id": -1 }).exec((err, docs) => {
        Lorirent.aggregate([{
            $match: {
                "registration": req.params.id.toUpperCase()
            }
        }, { $unwind: "$paid" }, {
            $match: {

                "paid.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]).sort({ "paid.date": -1, "paid._id": -1 }).exec((err, dics) => {
            Lorirent.find().distinct('registration').then(loari => {

                res.render('addlorirent', {
                    mainpath: '/addlorirent',
                    docs: docs,
                    loari: loari,
                    start: start,
                    end: end,
                    id: name,
                    individual: true,
                    dics: dics,
                    payment: payment
                })
            })
        })
    })



}
exports.fliterindividualaddlorirent = (req, res) => {
    let payment = req.flash('payment');
    if (payment.length > 0) {
        payment = payment[0];
    } else {
        payment = false;
    }
    name = req.body.id.toUpperCase(),

        start = new Date(req.body.sdate);
    end = new Date(req.body.edate);

    Lorirent.aggregate([{
        $match: {
            "registration": req.body.id.toUpperCase()
        }
    }, { $unwind: "$trips" }, {
        $match: {

            "trips.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "trips.date": -1, "trips._id": -1 }).exec((err, docs) => {
        Lorirent.aggregate([{
            $match: {
                "registration": req.body.id.toUpperCase()
            }
        }, { $unwind: "$paid" }, {
            $match: {

                "paid.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]).sort({ "paid.date": -1, "paid._id": -1 }).exec((err, dics) => {
            Lorirent.find().distinct('registration').then(loari => {

                res.render('addlorirent', {
                    mainpath: '/addlorirent',
                    docs: docs,
                    loari: loari,
                    start: start,
                    end: end,
                    id: name,
                    individual: true,
                    dics: dics,
                    payment: payment

                })
            })
        })
    })



}

exports.deleteloarirent = (req, res) => {

    Lorirent.findOne({ registration: req.params.objectid }).then((docs, err) => {
        docs.updateOne({
                $pull: {
                    "trips": {
                        _id: req.params.id
                    }
                }
            }, { safe: true, upsert: true },
            function(err, model) {
                console.log(err);

                if (req.params.section == 'individual') {
                    req.flash("payment", false)
                    res.redirect('/addindividuallorirent/' + number)
                } else {
                    req.flash("payment", false)
                    res.redirect('/addlorirent')
                }
            }
        )

    }).catch(err => {
        console.log(err)

    })



}
exports.deleteloaripayment = (req, res) => {

    Lorirent.findOne({ registration: req.params.objectid }).then((docs, err) => {
        docs.updateOne({
                $pull: {
                    "paid": {
                        _id: req.params.id
                    }
                }
            }, { safe: true, upsert: true },
            function(err, model) {
                console.log(err);


            }
        )

    }).then(docs => {
        Transaction.findByIdAndRemove(req.params.id).then((err, docs) => {
            if (err) console.log(err)
            if (req.params.section == 'individual') {
                req.flash("payment", true)
                res.redirect('/addindividuallorirent/' + number)
            } else {
                req.flash("payment", true)
                res.redirect('/addlorirent')
            }
        })
    })


}
exports.filterutility = (req, res) => {
    start = new Date(req.body.sdate);
    end = new Date(req.body.edate);


    Utility.aggregate([{ $unwind: "$detail" }, {
        $match: {

            "detail.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "detail.date": -1, "detail._id": -1 }).exec((err, docs) => {
        Utility.find().distinct('name').then(utitlity => {

            res.render('utilitybill', {
                mainpath: '/utility',
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
    }, { $unwind: "$detail" }, {
        $match: {

            "detail.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "detail.date": -1, "detail._id": -1 }).exec((err, docs) => {
        Utility.find().distinct('name').then(utitlity => {

            res.render('utilitybill', {
                mainpath: '/utility',
                docs: docs,
                start: start,
                end: end,
                individual: true,
                id: name,
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
    }, { $unwind: "$detail" }, {
        $match: {

            "detail.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "detail.date": -1, "detail._id": -1 }).exec((err, docs) => {
        Utility.find().distinct('name').then(utitlity => {

            res.render('utilitybill', {
                mainpath: '/utility',
                docs: docs,
                start: start,
                end: end,
                individual: true,
                id: name,
                utitlity: utitlity,

            })
        })
    })



}

exports.deleteutility = (req, res) => {

    Utility.findOne({ name: req.params.objectid }).then((docs, err) => {
        docs.updateOne({
                $pull: {
                    "detail": {
                        _id: req.params.id
                    }
                }
            }, { safe: true, upsert: true },
            function(err, model) {
                console.log(err);


            }
        )

    }).then(docs => {
        Transaction.findByIdAndRemove(req.params.id).then((err, docs) => {
            if (err) console.log(err)
            if (req.params.section == 'individual') {
                res.redirect('/indivual_utility/' + name)
            } else {
                res.redirect('/utility')
            }

        })
    })


}

/* ------------------------ */


exports.getpayments = (req, res) => {
    let recieved = req.flash('recieved');
    if (recieved.length > 0) {
        recieved = recieved[0];
    } else {
        recieved = false;
    }
    Payments.aggregate([{ $unwind: "$payment" }]).sort({ "payment.date": -1, "payment._id": -1 }).exec((err, data) => {
        Payments.aggregate([{ $unwind: "$paid" }]).sort({ "paid.date": -1, "paid._id": -1 }).exec((err, dics) => {
            Payments.find().distinct('name').then(names => {

                res.render('paymentmanage', {
                    mainpath: '/paymentsmanage',
                    docs: data,
                    individual: false,
                    names: names,
                    filter: false,
                    dics: dics,
                    recieved: recieved

                })
            })

        })
    })

}
exports.filterpayments = (req, res) => {
    var start = new Date(req.body.sdate)
    var end = new Date(req.body.edate)
    let recieved = req.flash('recieved');
    if (recieved.length > 0) {
        recieved = recieved[0];
    } else {
        recieved = false;
    }

    Payments.aggregate([{ $unwind: "$paid" }, {
        $match: {

            "paid.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "paid.date": -1, "paid._id": -1 }).exec((err, dics) => {
        Payments.aggregate([{ $unwind: "$payment" }, {
            $match: {

                "payment.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]).sort({ "payment.date": -1, "payment._id": -1 }).exec((err, data) => {
            Payments.find().distinct('name').then(names => {
                res.render('paymentmanage', {
                    mainpath: '/paymentsmanage',
                    docs: data,
                    start: start,
                    end: end,
                    individual: false,
                    names: names,
                    filter: true,
                    dics: dics,
                    recieved: recieved

                })
            })

        })

    })

}
exports.individualpayments = (req, res) => {
    let recieved = req.flash('recieved');
    if (recieved.length > 0) {
        recieved = recieved[0];
    } else {
        recieved = false;
    }

    var name = req.params.id
    Payments.aggregate([{
        $match: {
            "name": req.params.id
        }
    }, { $unwind: "$paid" }]).sort({ "paid.date": -1, "paid._id": -1 }).exec((err, dics) => {
        Payments.aggregate([{
            $match: {
                "name": req.params.id
            }
        }, { $unwind: "$payment" }]).sort({ "payment.date": -1, "payment._id": -1 }).exec((err, data) => {
            Payments.find().distinct('name').then(names => {
                res.render('paymentmanage', {
                    mainpath: '/paymentsmanage',
                    docs: data,

                    individual: true,
                    names: names,
                    filter: false,
                    dics: dics,
                    id: name,
                    recieved: recieved
                })
            })

        })

    })

}
exports.filterindividualpayments = (req, res) => {
    let recieved = req.flash('recieved');
    if (recieved.length > 0) {
        recieved = recieved[0];
    } else {
        recieved = false;
    }


    var start = new Date(req.body.sdate)
    var end = new Date(req.body.edate)
    name = req.body.id
    Payments.aggregate([{
        $match: {
            "name": name
        }
    }, { $unwind: "$paid" }, {
        $match: {

            "paid.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "paid.date": -1, "paid._id": -1 }).exec((err, dics) => {
        Payments.aggregate([{
            $match: {
                "name": name
            }
        }, { $unwind: "$payment" }, {
            $match: {

                "payment.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]).sort({ "payment.date": -1, "payment._id": -1 }).exec((err, data) => {
            Payments.find().distinct('name').then(names => {
                res.render('paymentmanage', {
                    mainpath: '/paymentsmanage',
                    docs: data,
                    start: start,
                    end: end,
                    individual: true,
                    names: names,
                    filter: true,
                    dics: dics,
                    id: name,
                    recieved: recieved
                })
            })
        })

    })

}
exports.paidamountform = (req, res) => {

    var name = req.body.name
    date = new Date(req.body.date)
    var amount = req.body.amount;
    const arrayid = new mongoose.Types.ObjectId()

    Payments.findOne({ name: name }).then(docs => {

        if (docs) {
            docs.updateOne({
                    $push: {
                        "payment": {
                            _id: arrayid,
                            date: date,
                            hint: req.body.hint,
                            amount: amount,


                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    if (err) console.log(err)


                }
            )
        } else {

            var paymentmanagent = new Payments({
                name: name.toUpperCase(),
                payment: [{
                    _id: arrayid,
                    date: date,
                    hint: req.body.hint,
                    amount: amount,

                }],
            })
            paymentmanagent.save((err, docs) => {
                if (err) console.log(err)

            })




        }

    }).then(docs => {

        var transaction = new Transaction({
            _id: arrayid,
            Date: date,
            amount: amount,
            types: "credit",
            comment: "Payment R. " + name,
            paymentmode: "bank / cash",
            credit: req.body.paid,
            section: "payment"

        })
        transaction.save((err, doc) => {
            if (req.body.type == 'individual') {
                req.flash("recieved", true)
                res.redirect('/individualpayments/' + name)
            } else {
                req.flash("recieved", true)
                res.redirect('/getpayments')
            }

        })
    })



}

exports.postpaid = (req, res) => {

    var name = req.body.name
    date = new Date(req.body.date)
    var amount = req.body.amount;
    const arrayid = new mongoose.Types.ObjectId()

    Payments.findOne({ name: name }).then(docs => {

        if (docs) {
            docs.updateOne({
                    $push: {
                        "paid": {
                            _id: arrayid,
                            date: date,
                            hint: req.body.hint,
                            amount: amount,


                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    if (err) console.log(err)



                }
            )
        } else {

            var paymentmanagent = new Payments({
                name: name.toUpperCase(),
                paid: [{
                    _id: arrayid,
                    date: date,
                    hint: req.body.hint,
                    amount: amount,

                }],
            })
            paymentmanagent.save((err, docs) => {
                if (err) console.log(err)

            })




        }

    }).then(docs => {

        var transaction = new Transaction({
            _id: arrayid,
            Date: date,
            amount: amount,
            types: "debit",
            comment: "Payment To. " + name,
            paymentmode: "bank / cash",
            debit: req.body.paid,
            section: "payment"

        })
        transaction.save((err, doc) => {
            if (req.body.type == 'individual') {
                req.flash("recieved", false)
                res.redirect('/individualpayments/' + name)
            } else {
                req.flash("recieved", false)
                res.redirect('/getpayments')
            }

        })
    })



}
exports.deletepaid = (req, res) => {

    Payments.findOne({ name: req.params.objectid }).then((docs, err) => {
        docs.updateOne({
                $pull: {
                    "paid": {
                        _id: req.params.id
                    }
                }
            }, { safe: true, upsert: true },
            function(err, model) {
                console.log(err);


            }
        )

    }).then(docs => {
        Transaction.findByIdAndDelete(req.params.id).then((err, docs) => {
            if (err) console.log(err)
            if (req.params.section == 'individual') {
                req.flash("recieved", false)
                res.redirect('/individualpayments/' + req.params.objectid)
            } else {
                req.flash("recieved", false)
                res.redirect('/getpayments')
            }
        })

    })



}
exports.deletepayment = (req, res) => {

    Payments.findOne({ name: req.params.objectid }).then((docs, err) => {
        docs.updateOne({
                $pull: {
                    "payment": {
                        _id: req.params.id
                    }
                }
            }, { safe: true, upsert: true },
            function(err, model) {
                console.log(err);


            }
        )

    }).then(docs => {
        Transaction.findByIdAndRemove(req.params.id).then((err, docs) => {
            if (err) console.log(err)
            if (req.params.section == 'individual') {
                req.flash("recieved", true)
                res.redirect('/individualpayments/' + req.params.objectid)
            } else {
                req.flash("recieved", true)
                res.redirect('/getpayments')
            }
        })
    })


}

exports.deleteloader = (req, res) => {


    Loaders.findByIdAndDelete(req.params.id).then((docs, err) => {
        if (err) console.log(err)
        return res.redirect('/loaderslist')
    })


}
exports.deleteloari = (req, res) => {


    Lorirent.findByIdAndDelete(req.params.id).then((docs, err) => {
        if (err) console.log(err)
        return res.redirect('/lorilist')
    })
}