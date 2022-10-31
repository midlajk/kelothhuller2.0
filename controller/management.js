require('../model/accountsmodal')

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
var fs = require('fs');
const Sellers = mongoose.model('Sellers');
const Users = mongoose.model('Users');
const Buyers = mongoose.model('Buyers');
const Payments = mongoose.model('Payments');
const moment = require("moment");


const Names = mongoose.model('Names');
const generateUniqueId = require('generate-unique-id');


exports.postdetailedbuyerdata = (req, res) => {
    var totalpayment = parseInt(req.body.total) || 0;
    const objectid = new mongoose.Types.ObjectId()
    date = new Date(req.body.date)
    var arrayid
    if (req.body.id) {
        arrayid = req.body.id
    } else {
        arrayid = new mongoose.Types.ObjectId()
    }
    var amount
    var category
    var paymentamount
    if (req.body.amount < 0) {
        amount = req.body.amount;
        paymentamount = -req.body.amount;
        category = 'recieved'
    } else if (req.body.category == 'recieved') {
        amount = -req.body.amount;
        paymentamount = req.body.amount;
        category = 'recieved'

    } else {
        amount = req.body.amount || 0;
        paymentamount = req.body.amount || 0;
        category = 'payment'

    }

    var name = req.body.name.toUpperCase().trim().split('-')[0];
    Sellers.findOne({ name: name }).then((docs, err) => {

        if (docs) {
            var maintotal = docs.total + totalpayment - (amount || 0);
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
                            date: date,
                            dateadded: new Date(),
                            kilogram: req.body.kilogram || 0,
                            price: req.body.kgprice || 0,
                            bagprice: parseInt(req.body.kgprice * 50) || 0,
                            total: totalpayment,
                            hint: req.body.hint,
                            paid: amount

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
                total: totalpayment - amount,
                deal: [{
                    id: arrayid,
                    date: date,
                    dateadded: new Date(),
                    kilogram: req.body.kilogram || 0,
                    price: req.body.kgprice || 0,
                    bagprice: parseInt(req.body.kgprice * 50) || 0,
                    total: totalpayment,
                    hint: req.body.hint,
                    paid: amount

                }]

            })
            sellers.save(function(err, doc) {

            })



        }
    }).then(doc => {
        if (req.body.amount && req.body.amount != 0) {
            var paymentmanagent = new Payments({

                name: name,
                _id: arrayid,
                hint: req.body.hint,
                amount: paymentamount,
                relation: 'Purchase',
                date: date,
                dateadded: new Date(),
                category: category,


            })
            paymentmanagent.save((err, docs) => {
                returnpage()
            })
        } else {
            returnpage()
        }




    })

    function returnpage() {
        if (req.body.type == "seperate") {
            req.flash('error', "successfully added")
            res.redirect('/purchasemanagement')
        } else if (req.body.type == "paymentpage") {
            req.flash("recieved", false)
            res.redirect('/getpayments')
        } else if (req.body.type == "recievedpage") {
            req.flash("recieved", true)
            res.redirect('/getpayments')
        } else {
            req.flash('error', "Successfully added")
            res.redirect('/individualpurchase/' + name);
        }
    }
}
exports.deletepurchase = (req, res) => {
    Sellers.findOne({ name: req.params.name }).then((docs, err) => {
        if (docs) {
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


                }
            )
        }

    }).then((docs, err) => {
        Payments.findByIdAndDelete(req.params.arrayid).then((err, docs) => {

        })
        if (req.params.type == "seperate") {
            res.redirect('/purchasemanagement')
        } else if (req.params.type == "payments") {
            req.flash("recieved", false)
            res.redirect('/getpayments')
        } else if (req.params.type == "recieved") {
            req.flash("recieved", true)
            res.redirect('/getpayments')
        } else {
            res.redirect('/individualpurchase/' + req.params.name)
        }


    })
};
exports.postbuyerform = (req, res) => {
    var totalpayment = parseInt(req.body.total) || 0;
    var tds = parseInt(totalpayment - (totalpayment * (req.body.tds / 100))) || 0
    const objectid = new mongoose.Types.ObjectId()
    date = new Date(req.body.date)
    var arrayid
    if (req.body.id) {
        arrayid = req.body.id
    } else {
        arrayid = new mongoose.Types.ObjectId()
    }
    var amount
    var category
    var paymentamount
    if (req.body.amount < 0) {
        amount = req.body.amount;
        paymentamount = -req.body.amount;
        category = 'payment'

    } else if (req.body.category == 'payment') {
        amount = -req.body.amount;
        paymentamount = req.body.amount;
        category = 'payment'

    } else {
        amount = req.body.amount || 0;
        paymentamount = req.body.amount || 0;
        category = 'recieved'

    }
    var name = req.body.name.toUpperCase().trim().split('-')[0];
    var loari = req.body.loari ? req.body.loari.toUpperCase().trim() : '';
    Buyers.findOne({ name: name }).then(docs => {
        if (docs) {
            var maintotal = docs.total + tds - amount;
            docs.updateOne({
                    total: maintotal

                }, { safe: true, upsert: true },
                function(err, model) {


                }
            )

            docs.updateOne({
                    $push: {
                        "deal": {
                            dateadded: new Date(),
                            id: arrayid,
                            date: req.body.date,
                            kilogram: req.body.kilogram || 0,
                            price: req.body.price || 0,
                            tds: tds || 0,
                            total: totalpayment || 0,
                            hint: req.body.hint,
                            loari: loari,
                            paid: amount || 0

                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {}
            )

        } else {
            var buyers = new Buyers({

                id: objectid,
                name: name,
                total: tds - amount,
                deal: [{
                    dateadded: new Date(),
                    id: arrayid,
                    date: req.body.date,
                    kilogram: req.body.kilogram || 0,
                    price: req.body.price || 0,
                    total: totalpayment,
                    tds: tds || 0,
                    loari: loari,
                    hint: req.body.hint,
                    paid: amount || 0

                }]

            })


            buyers.save(function(err, doc) {


            })


        }
    }).then(docs => {
        if (req.body.amount != 0) {
            var paymentmanagent = new Payments({


                name: name,
                _id: arrayid,
                hint: req.body.hint,
                amount: paymentamount,
                relation: 'Sales',
                date: date,
                dateadded: new Date(),
                category: category,


            })
            paymentmanagent.save((err, docs) => {
                returnpage()
            })
        } else {
            returnpage()
        }




    })

    function returnpage() {
        if (req.body.type == "seperate") {
            req.flash('error', "Successfully added")
            res.redirect('/salesmanagement')
        } else if (req.body.type == "paymentpage") {
            req.flash("recieved", false)
            res.redirect('/getpayments')
        } else if (req.body.type == "recievedpage") {
            req.flash("recieved", true)
            res.redirect('/getpayments')
        } else {
            req.flash('error', "Successfully added")
            res.redirect('/individualsales/' + name);
        }
    }







}
exports.deletesales = (req, res) => {
    var name
    Buyers.findOne({ name: req.params.name }).then((docs, err) => {
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


            }
        )

    }).then((err, docs) => {
        if (err) console.log(err)
        Payments.findByIdAndDelete(req.params.arrayid).then((err, docs) => {

        })

        if (req.params.type == "seperate") {
            res.redirect('/salesmanagement')
        } else if (req.params.type == "payments") {
            req.flash("recieved", false)
            res.redirect('/getpayments')
        } else if (req.params.type == "recieved") {
            req.flash("recieved", true)
            res.redirect('/getpayments')
        } else {
            res.redirect('/individualsales/' + name)
        }


    })
};

exports.salesmanagement = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    var start = new Date()
    var end = new Date()
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999)


    Buyers.aggregate([{ $unwind: "$deal" }, {
            $match: {

                "deal.dateadded": {
                    $gte: start,
                    $lt: end
                },
                "deal.total": {
                    $gt: 0,
                }
            }
        }


    ]).sort({ "deal.date": -1, "deal._id": -1 }).exec((err, datas) => {
        Buyers.find().distinct('name').then(buyers => {
            Sellers.find().distinct('name').then(sellers => {
                namesnew = buyers.concat(sellers);
                var uniqueSet = new Set(namesnew);
                var names = Array.from(uniqueSet);
                res.render('salesmanagement', {
                    mainpath: '/sales',
                    subpath: '',
                    buyer: datas,
                    names: names,
                    errorMessage: message,
                    start: 'TODAY',
                    end: '! Filter to see more data',
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
                },
                "deal.total": {
                    $gt: 0,
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
                },
                "deal.total": {
                    $gt: 0,
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
                },
                "deal.total": {
                    $gt: 0,
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
                },
                "deal.total": {
                    $gt: 0,
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
                    mainpath: '/sales',
                    subpath: '',
                    buyer: data,
                    names: names,
                    errorMessage: message,
                    start: ' FROM ' + start.toLocaleDateString(),
                    end: ' TO ' + end.toLocaleDateString(),

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
    var start = new Date()
    var end = new Date()
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999)

    Sellers.aggregate([{ $unwind: "$deal" }, {
        $match: {

            "deal.dateadded": {
                $lt: end,
                $gte: start,

            },
            "deal.total": {
                $gt: 0,
            }
        }


    }]).sort({ "deal.date": -1, "deal._id": -1 }).exec(async(err, datas) => {
        const buyers = await Buyers.find().distinct('name').lean();
        const sellers = await Sellers.find().distinct('name').lean();
        namesnew = buyers.concat(sellers);
        var uniqueSet = new Set(namesnew);
        var names = Array.from(uniqueSet);
        res.render('purchasemanagement', {
            mainpath: '/stockmanagement',
            subpath: '',
            seller: datas,
            names: names,
            errorMessage: message,
            start: 'TODAY',
            end: '! Filter to see more data',
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
        filter = [{ $unwind: "$deal" }, {
            $match: {

                "deal.date": {
                    $lt: end,
                    $gte: start
                },
                "deal.total": {
                    $gt: 0,
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
                },
                "deal.total": {
                    $gt: 0,
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
                },
                "deal.total": {
                    $gt: 0,
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
                },
                "deal.total": {
                    $gt: 0,
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
                    start: 'FROM ' + start.toLocaleDateString(),
                    end: ' TO ' + end.toLocaleDateString(),
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

        Sellers.aggregate(filter).sort({ "deal._id": -1 }).exec((err, data) => {

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
                    mainpath: '/sales',
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
                        mainpath: '/sales',
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

exports.editorder = (req, res) => {

    var totalpayment = parseInt(req.body.edittotal) || 0
    var tdstotal = parseInt(req.body.tdstotal) || 0
    var paymentamount
    var category
    let amount = 0
    if (req.body.section == "sales" && req.body.paid < 0) {
        paymentamount = -req.body.paid
        category = 'payment'
    } else if (req.body.section == "purchase" && req.body.paid < 0) {
        paymentamount = -req.body.paid
        category = 'recieved'
    } else {
        paymentamount = req.body.paid
        category = req.body.section == "sales" ? 'recieved' : 'payment'
    }

    if (req.body.section == "sales") {
        var loari = req.body.editloari ? req.body.editloari.toUpperCase().trim() : '';
        var name

        Buyers.findOne({ id: req.body.objectid }).then(docs => {
            name = docs.name

            var maintotal = docs.total - parseInt(req.body.previoustotal) + parseInt(req.body.previouspaid) + tdstotal - parseInt(req.body.paid || 0)

            docs.updateOne({
                    total: maintotal,

                }, { safe: true, upsert: true },
                function(err, model) {

                }
            )
            Buyers.findOneAndUpdate({ id: req.body.objectid, deal: { $elemMatch: { id: req.body.arrayid } } }, {

                        $set: {
                            'deal.$.dateadded': new Date(),
                            'deal.$.date': req.body.editdate,
                            'deal.$.loari': loari,
                            'deal.$.kilogram': req.body.editkilogram,
                            'deal.$.price': req.body.editprize,
                            'deal.$.tds': tdstotal,
                            'deal.$.total': totalpayment,
                            'deal.$.hint': req.body.hint,
                            'deal.$.paid': req.body.paid

                        }
                    }, // list fields you like to change
                    { 'new': true, 'safe': true, 'upsert': true })
                .then(docs => {
                    paymentchange(name)
                    if (req.body.types == "seperate") {
                        req.flash('error', "Successfully Editted")
                        res.redirect('/salesmanagement')

                    } else {
                        req.flash('error', "Successfully Editted")
                        res.redirect('/individualsales/' + name)
                    }

                })
        })

    } else {

        var name
        Sellers.findOne({ id: req.body.objectid }).then(docs => {
            name = docs.name;
            var maintotal = docs.total - parseInt(req.body.previoustotal) + parseInt(req.body.previouspaid) + totalpayment - parseInt(req.body.paid || 0)
            docs.updateOne({
                    total: maintotal,

                }, { safe: true, upsert: true },
                function(err, model) {

                }
            )
            Sellers.findOneAndUpdate({ id: req.body.objectid, deal: { $elemMatch: { id: req.body.arrayid } } }, {

                        $set: {
                            'deal.$.dateadded': new Date(),
                            'deal.$.date': req.body.editdate,
                            'deal.$.kilogram': req.body.editkilogram,
                            'deal.$.price': req.body.editprize,
                            'deal.$.bagprice': parseInt(req.body.editprize * 50),
                            'deal.$.total': totalpayment,
                            'deal.$.Remaining': maintotal,
                            'deal.$.hint': req.body.hint,
                            'deal.$.paid': req.body.paid
                        }
                    }, // list fields you like to change
                    { 'new': true, 'safe': true, 'upsert': true })
                .then(docs => {

                    paymentchange(name)
                    if (req.body.types == "seperate") {
                        req.flash('error', "Successfully added")
                        res.redirect('/purchasemanagement')
                    } else {
                        req.flash('error', "Successfully added")
                        res.redirect('/individualpurchase/' + name)
                    }

                })

        })


    }

    function paymentchange(name) {
        Payments.findByIdAndUpdate(req.body.arrayid).then(docs => {
            if (docs) {
                docs.hint = req.body.hint
                docs.amount = paymentamount || 0
                docs.date = new Date(req.body.editdate)
                docs.dateadded = new Date()
                docs.category = category
                docs.save()
            } else if (req.body.paid > 0 || req.body.paid < 0) {
                var paymentmanagent = new Payments({

                    name: name,
                    _id: req.body.arrayid,
                    hint: req.body.hint,
                    amount: paymentamount,
                    relation: req.body.section == "sales" ? 'Sales' : 'Purchase',
                    date: new Date(req.body.editdate),
                    dateadded: new Date(),
                    category: category,


                })
                paymentmanagent.save((err, docs) => {})
            } else {

            }

        })
    }
}



////////////////////Storage ///////////
exports.purchasestoragemanagement = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    var start = new Date()
    var end = new Date()
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999)

    Sellers.aggregate([{ $unwind: "$storage" }]).sort({ "storage.date": -1, "storage._id": -1 }).exec(async(err, datas) => {
        const buyers = await Sellers.find().distinct('name').lean();
        res.render('purchasestoragemanagement', {
            mainpath: '/storagemanagement',
            subpath: '',
            seller: datas,
            names: buyers,
            errorMessage: message,
            start: 'TODAY',
            end: '! Filter to see more data',
        })
    })


}
exports.salesstoragemanagement = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    var start = new Date()
    var end = new Date()
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999)

    Buyers.aggregate([{ $unwind: "$storage" }]).sort({ "storage.date": -1, "storage._id": -1 }).exec(async(err, datas) => {
        const sellers = await Buyers.find().distinct('name').lean();

        res.render('salesstoragemanagement', {
            mainpath: '/storagemanagement',
            subpath: '',
            seller: datas,
            names: sellers,
            errorMessage: message,
            start: 'TODAY',
            end: '! Filter to see more data',
        })
    })


}
exports.addpuchasestorage = (req, res) => {
    date = new Date(req.body.date)
    var name = req.body.name.toUpperCase().trim().split('-')[0];
    const objectid = new mongoose.Types.ObjectId()

    Sellers.findOne({ name: name }).then((docs, err) => {

        if (docs) {

            docs.updateOne({

                    $push: {

                        "storage": {

                            date: date,
                            kilogram: req.body.kilogram || 0,
                            price: req.body.price || 0,
                            product: req.body.product,


                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {

                    res.redirect('/purchasestoragemanagement')
                }
            )

        } else {
            var sellers = new Sellers({

                id: objectid,
                name: name,
                total: 0,
                storage: [{
                    date: date,
                    kilogram: req.body.kilogram || 0,
                    price: req.body.price || 0,
                    product: req.body.product,

                }]

            })
            sellers.save(function(err, doc) {
                console.log(err, docs)
                res.redirect('/purchasestoragemanagement')

            })



        }
    })


}

exports.addsalesstorage = (req, res) => {
    date = new Date(req.body.date)
    var name = req.body.name.toUpperCase().trim().split('-')[0];
    const objectid = new mongoose.Types.ObjectId()

    Buyers.findOne({ name: name }).then((docs, err) => {
        if (docs) {
            docs.updateOne({

                    $push: {

                        "storage": {

                            date: date,
                            kilogram: req.body.kilogram || 0,
                            price: req.body.price || 0,
                            product: req.body.product,

                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {

                    res.redirect('/salesstoragemanagement')

                }
            )

        } else {
            var buyer = new Buyers({
                name: name,
                total: 0,
                id: objectid,
                storage: [{
                    date: date,
                    kilogram: req.body.kilogram || 0,
                    price: req.body.price || 0,
                    product: req.body.product,

                }]

            })
            buyer.save((err, docs) => {
                res.redirect('/salesstoragemanagement')

            })

        }
    })
}


exports.editpuchasestorage = (req, res) => {
    Sellers.findOneAndUpdate({ _id: req.body.objectid, storage: { $elemMatch: { _id: req.body.arrayid } } }, {

                $set: {
                    'storage.$.date': req.body.date,
                    'storage.$.kilogram': req.body.kilogram,
                    'storage.$.price': req.body.price,
                    'storage.$.product': req.body.product,
                    'storage.$.settlementquntity': (req.body.settled + req.body.newsettlement),


                }
            }, // list fields you like to change
            { 'new': true, 'safe': true, 'upsert': true })
        .then(docs => {


            res.redirect('/purchasestoragemanagement')

        })


}
exports.editsalesstorage = (req, res) => {
    Buyers.findOneAndUpdate({ _id: req.body.objectid, storage: { $elemMatch: { _id: req.body.arrayid } } }, {

                $set: {
                    'storage.$.date': req.body.date,
                    'storage.$.kilogram': req.body.kilogram,
                    'storage.$.price': req.body.price,
                    'storage.$.product': req.body.product,
                    'storage.$.settlementquntity': (req.body.settled + req.body.newsettlement),


                }
            }, // list fields you like to change
            { 'new': true, 'safe': true, 'upsert': true })
        .then((docs, err) => {

            console.log(err)
            res.redirect('/salesstoragemanagement')

        })


}



exports.deletepurchasestorage = (req, res) => {
    Sellers.findOne({ name: req.params.name }).then((docs, err) => {
        if (docs) {

            docs.updateOne({
                    $pull: {
                        "storage": {
                            _id: req.params.arrayid
                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    res.redirect('/purchasestoragemanagement')


                }
            )
        }

    })
}
exports.deletesalesestorage = (req, res) => {
    Buyers.findOne({ name: req.params.name }).then((docs, err) => {
        if (docs) {

            docs.updateOne({
                    $pull: {
                        "storage": {
                            _id: req.params.arrayid
                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {

                    res.redirect('/salesstoragemanagement')

                }
            )
        }

    })
}