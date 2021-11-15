require('../model/accountsmodal')
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
var fs = require('fs');
const Sellers = mongoose.model('Sellers');
const Users = mongoose.model('Users');
const Buyers = mongoose.model('Buyers');

const Transaction = mongoose.model('Transaction');

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
    var start = new Date(08 / 03 / 2000)
    var end = new Date()


    Buyers.aggregate([{ $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        },


    ]).sort({ "deal.date": -1, "deal._id": -1 }).exec((err, data) => {
        Sellers.aggregate([{ $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            },

        }]).sort({ "deal.date": -1, "deal._id": -1 }).exec((err, datas) => {
            Buyers.find().distinct('name').then(buyers => {
                Sellers.find().distinct('name').then(sellers => {
                    namesnew = buyers.concat(sellers);
                    var uniqueSet = new Set(namesnew);
                    var uniqueArr = Array.from(uniqueSet);

                    res.render('accountmanagement', {
                        mainpath: '/stockmanagement',
                        subpath: '',
                        buyer: data,
                        seller: datas,
                        start: start,
                        end: end,
                        names: uniqueArr,
                        errorMessage: message
                    })
                }).catch(err => console.log(err));
            })
        })
    })

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

    var filter = [{ $unwind: "$deal" }]
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
        }]

    } else if (req.body.type == '2months') {
        start.setMonth(start.getMonth() - 2);


        filter = [{ $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]
    } else if (req.body.type == '5months') {
        start.setMonth(start.getMonth() - 5);

        filter = [{ $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]

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
        }]
    } else {
        start = new Date(08 / 03 / 2000)

        filter = [{ $unwind: "$deal" }]

    }

    Buyers.aggregate(filter).sort({ "deal.date": -1, "deal._id": -1 }).exec((err, data) => {
        Sellers.aggregate(filter).sort({ "deal.date": -1, "deal._id": -1 }).exec((err, datas) => {
            Buyers.find().distinct('name').then(buyers => {
                Sellers.find().distinct('name').then(sellers => {
                    namesnew = buyers.concat(sellers);
                    var uniqueSet = new Set(namesnew);
                    var names = Array.from(uniqueSet);

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

            })
        })
    })

}
exports.postdetailedbuyerdata = (req, res) => {

    var totalpayment
    var price;
    if (req.body.through == 'quatity') {
        totalpayment = 0

    } else {

        totalpayment = parseInt(req.body.total);

    }

    const objectid = new mongoose.Types.ObjectId()
    const arrayid = new mongoose.Types.ObjectId()
    var name = req.body.buyer.toUpperCase().trim();

    Sellers.findOne({ name: name }).then((docs, err) => {


        if (err) {
            console.log(err)
        }
        if (docs) {
            var maintotal = docs.total - parseInt(req.body.paid) + totalpayment;
            docs.updateOne({
                    total: maintotal

                }, { safe: true, upsert: true },
                function(err, model) {

                }
            )
            docs.updateOne({

                    $push: {

                        "deal": {

                            id: arrayid,
                            date: req.body.date,
                            kilogram: req.body.kilogram,
                            price: req.body.price,
                            total: totalpayment,
                            paid: req.body.paid,
                            Remaining: maintotal,
                            through: req.body.through,
                            hint: req.body.hint

                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {


                }
            )

        } else {
            var sellers = new Sellers({

                id: objectid,
                name: name,
                total: totalpayment - parseInt(req.body.paid),
                deal: [{
                    id: arrayid,
                    date: req.body.date,
                    kilogram: req.body.kilogram,
                    price: req.body.price,
                    total: totalpayment,
                    paid: req.body.paid,
                    Remaining: totalpayment - parseInt(req.body.paid),
                    through: req.body.through,
                    hint: req.body.hint

                }]

            })
            sellers.save(function(err, doc) {

            })



        }
    }).then((err, docs) => {
        if (err) console.log(err)
        var paymentmode
        if (req.body.through) {
            paymentmode = req.body.through
        } else {
            paymentmode = "bank";
        }

        if (parseInt(req.body.paid) > 0) {

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



    }).then(doc => {
        if (req.body.type == "seperate") {
            req.flash('error', "successfully added")
            res.redirect('/purchasemanagement')
        } else {
            req.flash('error', "Successfully added")
            res.redirect('/individualpurchase/' + name);

        }
    })



}
exports.deletepurchase = (req, res) => {

    Sellers.findOne({ id: req.params.objectid }).then((docs, err) => {

        name = docs.name
        var maintotal = docs.total - parseInt(req.params.total) + parseInt(req.params.paid)
        docs.updateOne({
                total: maintotal

            }, { safe: true, upsert: true },
            function(err, model) {

            }
        )
        docs.updateOne({
                $pull: {
                    "deal": {
                        id: req.params.arrayid
                    }
                }
            }, { safe: true, upsert: true },
            function(err, model) {
                console.log(err);


            }
        )


    }).then((docs, err) => {
        if (err) console.log("error")
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
    var totalpayment
    if (req.body.through == 'quatity') {
        totalpayment = 0
    } else {
        totalpayment = parseInt(req.body.total);
    }
    const objectid = new mongoose.Types.ObjectId()
    const arrayid = new mongoose.Types.ObjectId()
    var name = req.body.buyer.toUpperCase().trim();

    Buyers.findOne({ name: name }).then(docs => {
        if (docs) {
            var maintotal = docs.total - parseInt(req.body.paid) + totalpayment;
            docs.updateOne({
                    total: maintotal

                }, { safe: true, upsert: true },
                function(err, model) {


                }
            )

            docs.updateOne({
                    $push: {
                        "deal": {

                            id: arrayid,
                            date: req.body.date,
                            bags: req.body.bags,
                            kilogram: req.body.kilogram,
                            price: req.body.price,
                            total: totalpayment,
                            paid: req.body.paid,
                            Remaining: maintotal,
                            through: req.body.through,
                            hint: req.body.hint

                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    console.log(err);

                }
            )

        } else {
            var buyers = new Buyers({

                id: objectid,
                name: name,
                total: totalpayment - parseInt(req.body.paid),
                deal: [{

                    id: arrayid,
                    date: req.body.date,
                    bags: req.body.bags,
                    kilogram: req.body.kilogram,
                    price: req.body.price,
                    total: totalpayment,
                    paid: req.body.paid,
                    Remaining: totalpayment - parseInt(req.body.paid),
                    through: req.body.through,
                    hint: req.body.hint

                }]

            })


            buyers.save(function(err, doc) {



            })


        }
    }).then(docs => {
        var paymentmode
        if (req.body.through) {
            paymentmode = req.body.through;
        } else {
            paymentmode = "bank";
        }

        if (parseInt(req.body.paid) > 0) {
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

    }).then(doc => {
        if (req.body.type == "seperate") {
            req.flash('error', "Successfully added")
            res.redirect('/salesmanagement')
        } else {
            req.flash('error', "Successfully added")
            res.redirect('/individualsales/' + name);
        }
    })






}
exports.deletesales = (req, res) => {
    var name
    Buyers.findOne({ id: req.params.objectid }).then((docs, err) => {
        name = docs.name

        docs.updateOne({
                total: docs.total - parseInt(req.params.total) + parseInt(req.params.paid)

            }, { safe: true, upsert: true },
            function(err, model) {



            }
        )

        docs.updateOne({
                $pull: {
                    "deal": {
                        id: req.params.arrayid
                    }
                }
            }, { safe: true, upsert: true },
            function(err, model) {
                console.log(err);


            }
        )

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
    var start = new Date(08 / 03 / 2000)
    var end = new Date()
    Buyers.aggregate([{ $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        },


    ]).sort({ "deal.date": -1, "deal._id": -1 }).exec((err, datas) => {
        Buyers.find().distinct('name').then(buyers => {
            Sellers.find().distinct('name').then(sellers => {
                namesnew = buyers.concat(sellers);
                var uniqueSet = new Set(namesnew);
                var names = Array.from(uniqueSet);
                res.render('salesmanagement', {
                    mainpath: '/stockmanagement',
                    subpath: '',
                    buyer: datas,
                    names: names,
                    errorMessage: message,
                    start: start,
                    end: end,
                })
            }).catch(err => console.log(err));
        })
    })

}
exports.salesfilter = (req, res) => {

    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    var end = new Date()
    var start = new Date()

    var filter = [{ $unwind: "$deal" }]
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
        }]

    } else if (req.body.type == '2months') {
        start.setMonth(start.getMonth() - 2);


        filter = [{ $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]
    } else if (req.body.type == '5months') {
        start.setMonth(start.getMonth() - 5);

        filter = [{ $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]

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
        }]
    } else {
        start = "08/03/2000"

        filter = [{ $unwind: "$deal" }]

    }

    Buyers.aggregate(filter).sort({ "deal.date": -1, "deal._id": -1 }).exec((err, data) => {
        Buyers.find().distinct('name').then(buyers => {
            Sellers.find().distinct('name').then(sellers => {
                namesnew = buyers.concat(sellers);
                var uniqueSet = new Set(namesnew);
                var names = Array.from(uniqueSet);
                res.render('salesmanagement', {
                    mainpath: '/stockmanagement',
                    subpath: '',
                    buyer: data,
                    names: names,
                    errorMessage: message,
                    start: start,
                    end: end,

                })
            }).catch(err => console.log(err));

        })
    })

}
exports.purchasemanagement = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    var start = new Date(08 / 03 / 2000)
    var end = new Date()
    Sellers.aggregate([{ $unwind: "$deal" }, {
        $match: {

            "deal.date": {
                $lt: end,
                $gte: start
            }
        },

    }]).sort({ "deal.date": -1, "deal._id": -1 }).exec((err, datas) => {
        Buyers.find().distinct('name').then(buyers => {
            Sellers.find().distinct('name').then(sellers => {
                namesnew = buyers.concat(sellers);
                var uniqueSet = new Set(namesnew);
                var names = Array.from(uniqueSet);
                res.render('purchasemanagement', {
                    mainpath: '/stockmanagement',
                    subpath: '',
                    seller: datas,
                    names: names,
                    errorMessage: message,
                    start: start,
                    end: end,
                })
            }).catch(err => console.log(err));
        })
    })

}
exports.purchasefilter = (req, res) => {

    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    var end = new Date()
    var start = new Date()

    var filter = [{ $unwind: "$deal" }]
    if (req.body.type == 'filter') {

        start = new Date(req.body.sdate);
        end = new Date(req.body.edate);

        console.log(start)
        filter = [{ $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]

    } else if (req.body.type == '2months') {
        start.setMonth(start.getMonth() - 2);


        filter = [{ $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]
    } else if (req.body.type == '5months') {
        start.setMonth(start.getMonth() - 5);

        filter = [{ $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]

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
        }]
    } else {
        start = "08/03/2000"

        filter = [{ $unwind: "$deal" }]

    }

    Sellers.aggregate(filter).sort({ "deal.date": -1, "deal._id": -1 }).exec((err, data) => {

        Buyers.find().distinct('name').then(buyers => {
            Sellers.find().distinct('name').then(sellers => {
                namesnew = buyers.concat(sellers);
                var uniqueSet = new Set(namesnew);
                var names = Array.from(uniqueSet);
                res.render('purchasemanagement', {
                    mainpath: '/stockmanagement',
                    subpath: '',
                    seller: data,
                    names: names,
                    errorMessage: message,
                    start: start,
                    end: end,
                })
            }).catch(err => console.log(err));

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
    var start = new Date(08 / 03 / 2000)
    var end = new Date()
    Sellers.findOne({
        name: req.params.id
    }).then(name => {
        Sellers.aggregate([{
            $match: {
                "name": req.params.id
            }
        }, { $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]).sort({ "deal.date": -1, "deal._id": -1 }).exec((err, docs) => {
            Buyers.find().distinct('name').then(buyers => {
                Sellers.find().distinct('name').then(sellers => {
                    namesnew = buyers.concat(sellers);
                    var uniqueSet = new Set(namesnew);
                    var names = Array.from(uniqueSet);
                    res.render('individualsalesandpurchase', {
                        mainpath: '/stockmanagement',
                        category: 'purchase',
                        subpath: '',
                        data: docs,
                        errorMessage: message,
                        start: start,
                        end: end,
                        name: req.params.id.toUpperCase(),
                        names: names

                    })
                })
            }).catch(err => console.log(err));
        })
    }).catch(err => console.log(err));
}
exports.individualpurchasefilter = (req, res) => {

    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    var end = new Date()
    var start = new Date()

    var filter = [{
        $match: {
            "name": req.params.id
        }
    }, { $unwind: "$deal" }]
    if (req.body.type == 'filter') {

        start = new Date(req.body.sdate);
        end = new Date(req.body.edate);


        filter = [{
            $match: {
                "name": req.body.id
            }
        }, { $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]

    } else if (req.body.type == '2months') {
        start.setMonth(start.getMonth() - 2);


        filter = [{
            $match: {
                "name": req.body.id
            }
        }, { $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]
    } else if (req.body.type == '5months') {
        start.setMonth(start.getMonth() - 5);

        filter = [{
            $match: {
                "name": req.body.id
            }
        }, { $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]

    } else if (req.body.type == 'year') {
        start.setFullYear(start.getFullYear() - 1);
        (start)

        filter = [{
            $match: {
                "name": req.body.id
            }
        }, { $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]
    } else {
        start = "08/03/2000"

        filter = [{
            $match: {
                "name": req.body.id
            }
        }, { $unwind: "$deal" }]

    }
    Sellers.findOne({
        name: req.body.id
    }).then(name => {

        Sellers.aggregate(filter).sort({ "deal.date": -1, "deal._id": -1 }).exec((err, data) => {

            Buyers.find().distinct('name').then(buyers => {
                Sellers.find().distinct('name').then(sellers => {
                    namesnew = buyers.concat(sellers);
                    var uniqueSet = new Set(namesnew);
                    var names = Array.from(uniqueSet);
                    res.render('individualsalesandpurchase', {
                        mainpath: '/stockmanagement',
                        category: 'purchase',
                        subpath: '',
                        data: data,
                        names: names,
                        errorMessage: message,
                        start: start,
                        end: end,
                        name: req.body.id.toUpperCase()
                    })
                }).catch(err => console.log(err));

            })
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
    var start = new Date(08 / 03 / 2000)
    var end = new Date()
    Buyers.findOne({
        name: req.params.id
    }).then(name => {

        Buyers.aggregate([{
            $match: {
                "name": req.params.id
            }
        }, { $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]).sort({ "deal.date": -1, "deal._id": -1 }).exec((err, docs) => {
            Buyers.find().distinct('name').then(buyers => {
                Sellers.find().distinct('name').then(sellers => {
                    namesnew = buyers.concat(sellers);
                    var uniqueSet = new Set(namesnew);
                    var names = Array.from(uniqueSet);
                    res.render('individualsalesandpurchase', {
                        mainpath: '/stockmanagement',
                        category: 'sales',
                        subpath: '',
                        data: docs,
                        errorMessage: message,
                        start: start,
                        end: end,
                        name: req.params.id.toUpperCase(),
                        names: names
                    })

                })
            }).catch(err => console.log(err));
        })
    })


}
exports.individualsalesfilter = (req, res) => {

    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    var end = new Date()
    var start = new Date()

    var filter = [{
        $match: {
            "name": req.params.id
        }
    }, { $unwind: "$deal" }]
    if (req.body.type == 'filter') {

        start = new Date(req.body.sdate);
        end = new Date(req.body.edate);

        filter = [{
            $match: {
                "name": req.body.id
            }
        }, { $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]

    } else if (req.body.type == '2months') {
        start.setMonth(start.getMonth() - 2);


        filter = [{
            $match: {
                "name": req.body.id
            }
        }, { $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]
    } else if (req.body.type == '5months') {
        start.setMonth(start.getMonth() - 5);

        filter = [{
            $match: {
                "name": req.body.id
            }
        }, { $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]

    } else if (req.body.type == 'year') {
        start.setFullYear(start.getFullYear() - 1);
        (start)

        filter = [{
            $match: {
                "name": req.body.id
            }
        }, { $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]
    } else {
        start = "08/03/2000"

        filter = [{
            $match: {
                "name": req.params.id
            }
        }, { $unwind: "$deal" }]

    }
    Buyers.findOne({
        name: req.body.id
    }).then(name => {
        Buyers.aggregate(filter).sort({ "deal.date": -1, "deal._id": -1 }).exec((err, data) => {

            Buyers.find().distinct('name').then(buyers => {
                Sellers.find().distinct('name').then(sellers => {
                    namesnew = buyers.concat(sellers);
                    var uniqueSet = new Set(namesnew);
                    var names = Array.from(uniqueSet);
                    res.render('individualsalesandpurchase', {
                        mainpath: '/stockmanagement',
                        category: 'sales',
                        data: data,
                        names: names,
                        errorMessage: message,
                        start: start,
                        end: end,
                        name: req.body.id.toUpperCase()
                    })
                }).catch(err => console.log(err));

            })
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
exports.postedituser = (req, res) => {
    var name = req.body.names.toUpperCase().trim()
    var password = req.body.password
    Users.findOneAndUpdate({ name: name })
        .then(userDoc => {
            if (userDoc) {
                return bcrypt
                    .hash(password, 12)
                    .then(hashedPassword => {
                        userDoc.name = name;
                        userDoc.role = req.body.role;
                        userDoc.password = hashedPassword;
                        userDoc.previlage = req.body.previlage;
                        return userDoc.save();
                    })
            }


        })
        .then(result => {

            res.redirect('/adduser')
        });




}
exports.deleteuser = (req, res) => {

    Users.findByIdAndDelete(req.params.id)
        .then(userDoc => {
            res.redirect('/adduser')
        })





}

exports.utility = (req, res) => {
    var start = new Date(08 / 03 / 2000)
    var end = new Date()
    Utility.aggregate([{ $unwind: "$detail" }, {
        $match: {

            "detail.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "detail.date": -1, "detail._id": -1 }).exec((err, data) => {
        Utility.find().distinct('name').then(utitlity => {
            res.render('utilitybill', {
                mainpath: '/utility',
                docs: data,
                start: start,
                end: end,
                individual: false,
                utitlity: utitlity,

            })
        })

    })

}
exports.utilityform = (req, res) => {
    const arrayid = new mongoose.Types.ObjectId()
    var name = req.body.billto.toUpperCase().trim()
    date = new Date(req.body.date)
    Utility.findOne({ name: name }).then(docs => {
        if (docs) {
            docs.updateOne({
                    $push: {
                        "detail": {
                            _id: arrayid,
                            date: date,
                            payment: req.body.payment,
                            amount: req.body.amount

                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    if (err) console.log(err)


                }
            )
        } else {
            var utility = new Utility({
                name: name,
                detail: [{
                    _id: arrayid,
                    date: date,
                    payment: req.body.payment,
                    amount: req.body.amount
                }]

            })
            utility.save((err, docs) => {

            })

        }

    }).then(docs => {

        var transaction = new Transaction({
            _id: arrayid,
            Date: req.body.date,
            amount: req.body.amount,
            types: "debit",
            comment: "utility " + name,
            paymentmode: req.body.payment,
            debit: req.body.amount

        })
        transaction.save((err, doc) => {
            if (req.body.type == 'individual') {
                res.redirect('/indivual_utility/' + name)
            } else {
                res.redirect('/utility')
            }
        })
    })



}

exports.editorder = (req, res) => {
    console.log(req.body.objectid)
    console.log(req.body.arrayid)
    var totalpayment
    if (req.body.through == 'quatity') {
        totalpayment = 0

    } else {
        totalpayment = parseInt(req.body.edittotal)

    }

    if (req.body.section == "sales") {

        var name
        Buyers.findOne({ id: req.body.objectid }).then(docs => {
            name = docs.name

            var maintotal = docs.total - (parseInt(req.body.previoustotal) + parseInt(req.body.editpaid)) + totalpayment + parseInt(req.body.previouspaid)

            docs.updateOne({
                    total: maintotal,

                }, { safe: true, upsert: true },
                function(err, model) {

                }
            )
            Buyers.findOneAndUpdate({ id: req.body.objectid, deal: { $elemMatch: { id: req.body.arrayid } } }, {

                        $set: {

                            'deal.$.date': req.body.editdate,
                            'deal.$.bags': req.body.editbags,
                            'deal.$.kilogram': req.body.editkilogram,
                            'deal.$.price': req.body.editprize,
                            'deal.$.total': totalpayment,
                            'deal.$.outumn': req.body.autumn,
                            'deal.$.moisture': req.body.moisture,
                            'deal.$.paid': req.body.editpaid,
                            'deal.$.Remaining': maintotal,
                            'deal.$.hint': req.body.hint
                        }
                    }, // list fields you like to change
                    { 'new': true, 'safe': true, 'upsert': true })
                .then(docs => {
                    Transaction.findOne({ id: req.body.arrayid }).then(docs => {
                        if (docs) {
                            docs.Date = req.body.editdate;
                            docs.amount = req.body.editpaid;
                            docs.comment = req.body.hint;
                            docs.credit = req.body.editpaid;
                            docs.paymentmod = req.body.hint;

                            docs.save()
                        }
                    }).then(docs => {
                        if (req.body.types == "seperate") {
                            req.flash('error', "Successfully Editted")
                            res.redirect('/salesmanagement')

                        } else if (req.body.types == "detailedsalesandpurchase") {
                            req.flash('error', "Successfully Ediited")
                            res.redirect('/accountmanagement')

                        } else {
                            req.flash('error', "Successfully Editted")
                            res.redirect('/individualsales/' + name)
                                // res.redirect('/individualsales/' + name)
                        }
                    })
                })
        })

    } else {


        var name
        Sellers.findOne({ id: req.body.objectid }).then(docs => {
            name = docs.name;
            var maintotal = docs.total - (parseInt(req.body.previoustotal) + parseInt(req.body.editpaid)) + totalpayment + parseInt(req.body.previouspaid)

            docs.updateOne({
                    total: maintotal,

                }, { safe: true, upsert: true },
                function(err, model) {

                }
            )
            Sellers.findOneAndUpdate({ id: req.body.objectid, deal: { $elemMatch: { id: req.body.arrayid } } }, {

                        $set: {

                            'deal.$.date': req.body.editdate,
                            'deal.$.bags': req.body.editbags,
                            'deal.$.kilogram': req.body.editkilogram,
                            'deal.$.price': req.body.editprize,
                            'deal.$.total': totalpayment,
                            'deal.$.outumn': req.body.autumn,
                            'deal.$.moisture': req.body.moisture,
                            'deal.$.paid': req.body.editpaid,
                            'deal.$.Remaining': maintotal,
                            'deal.$.hint': req.body.hint
                        }
                    }, // list fields you like to change
                    { 'new': true, 'safe': true, 'upsert': true })
                .then(docs => {
                    Transaction.findOne({ id: req.body.arrayid }).then(docs => {
                        if (docs) {
                            docs.Date = req.body.editdate;
                            docs.amount = req.body.editpaid;
                            docs.comment = req.body.hint;
                            docs.debit = req.body.editpaid;
                            docs.paymentmod = req.body.hint;

                            docs.save()
                        }
                    }).then(docs => {
                        if (req.body.types == "seperate") {
                            req.flash('error', "Successfully added")
                            res.redirect('/purchasemanagement')
                        } else if (req.body.types == "detailedsalesandpurchase") {
                            req.flash('error', "Successfully added")
                            res.redirect('/accountmanagement')

                        } else {
                            req.flash('error', "Successfully added")
                            res.redirect('/individualpurchase/' + name)
                                // res.redirect('/individualsales/' + name)
                        }
                    })
                })

        })


    }
}
exports.getTransaction = (req, res) => {
    var start = new Date(08 / 03 / 2000)
    var end = new Date()
    Transaction.find({ //query today up to tonight
            Date: {
                $lt: end,
                $gte: start
            }
        })
        .sort({ Date: -1, _id: -1 }).exec((err, docs) => {

            res.render('transactions', {
                mainpath: '/transaction',
                data: docs,
                start: start,
                end: end

            })
        })


}





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
    }).sort({ Date: -1, _id: -1 }).exec((err, docs) => {


        res.render('transactions', {
            mainpath: '/transaction',
            data: docs,
            start: start,
            end: end

        })
    })

}