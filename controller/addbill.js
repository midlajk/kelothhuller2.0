require('../model/bill')
require('../model/accountsmodal')

const mongoose = require('mongoose');
var fs = require('fs');
const Sellers = mongoose.model('Sellers');
const Coffee_bill = mongoose.model('Coffee_bill');
const Pepper_bill = mongoose.model('Pepper_bill');
exports.addbill = (req, res) => {
    Sellers.find().distinct('name').then(sellers => {
        res.render('generatebill', {
            mainpath: '/addbill',
            errorMessage: "",
            loads: '',
            doc: sellers
        })
    })


}
exports.addcoffeebill = (req, res) => {
    console.log(req.body.type)
    var coffeebill = new Coffee_bill({
        seller: req.body.seller,
        product: [{
            date: req.body.date,
            category: req.body.type,
            numberofsack: req.body.bags,
            kg: [req.body.weight],
            totalkg: req.body.totalkg,
            cutting_per_bag: req.body.cutting,
            moisture: req.body.moisture,
            autumn: req.body.autumn,
            total: req.body.total,
            balance: req.body.balance,
            market: req.body.market,
            price_perkg: req.body.priceperkg,
            price_perbag: req.body.priceperbag,
            paid: req.body.paid,
            monitor: req.session.user.name
        }]
    })
    coffeebill.save((err, docs) => {
        res.redirect('/addbill')
    })



}
exports.addpepperbill = (req, res) => {

    var pepperbill = new Pepper_bill({
        seller: req.body.seller,
        product: [{
            date: req.body.date,
            numberofsack: req.body.bags,
            kg: [req.body.weight],
            totalkg: req.body.totalkg,
            cutting_per_bag: req.body.cutting,
            total: req.body.total,
            balance: req.body.balance,
            market: req.body.market,
            paid: req.body.paid,
            monitor: req.session.user.name,
            category: req.body.hint,
        }]
    })
    pepperbill.save((docs, err) => {

        res.redirect('/addbill')
    })


}
exports.coffeebill = (req, res) => {
    var end = new Date()
    var start = new Date()
    end.setDate(end.getDate() + 1);
    start.setDate(start.getDate() - 1);
    Coffee_bill.aggregate([{ $unwind: "$product" }, {
        $match: {

            "product.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).then(docs => {
        res.render('coffeebill', {
            mainpath: '/viewbill',
            errorMessage: "",
            loads: '',
            doc: '',
            start: [],
            end: [],
            names: [],
            seller: docs,

        })

    })


}
exports.filtercoffeebill = (req, res) => {

    var end = new Date()
    var start = new Date()

    var filter = [{ $unwind: "$product" }]
    if (req.body.type == 'filter') {

        start = new Date(req.body.sdate);
        end = new Date(req.body.edate);

        filter = [{ $unwind: "$product" }, {
            $match: {

                "product.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]

    } else if (req.body.type == 'yestersay') {

        start.setDate(start.getDate() - 2);
        end.setDate(end.getDate() - 2);
        filter = [{ $unwind: "$product" }, {
            $match: {

                "product.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]
    } else if (req.body.type == '1month') {
        start.setMonth(start.getMonth() - 1);
        filter = [{ $unwind: "$product" }, {
            $match: {

                "product.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]

    } else {
        start = new Date(08 / 03 / 2000)
        filter = [{ $unwind: "$product" }]

    }

    Coffee_bill.aggregate(filter).sort({ "product.date": -1, "product._id": -1 }).exec((err, data) => {

        res.render('coffeebill', {
            mainpath: '/viewbill',
            errorMessage: "",
            loads: '',
            doc: '',
            start: [],
            end: [],
            names: [],
            seller: data,
            start: start,
            end: end,

        })
    })


}
exports.pepperbill = (req, res) => {
    var end = new Date()
    var start = new Date()
    end.setDate(end.getDate() + 1);
    start.setDate(start.getDate() - 1);
    Pepper_bill.aggregate([{ $unwind: "$product" }, {
        $match: {

            "product.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).then(docs => {

        res.render('pepperbill', {
            mainpath: '/viewbill',
            errorMessage: "",
            loads: '',
            doc: [],
            start: [],
            end: [],
            names: [],
            seller: docs
        })
    })

}
exports.filterpepperbill = (req, res) => {

    var end = new Date()
    var start = new Date()

    var filter = [{ $unwind: "$product" }]
    if (req.body.type == 'filter') {

        start = new Date(req.body.sdate);
        end = new Date(req.body.edate);

        filter = [{ $unwind: "$product" }, {
            $match: {

                "product.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]

    } else if (req.body.type == 'yestersay') {

        start.setDate(start.getDate() - 2);
        end.setDate(end.getDate() - 1);
        filter = [{ $unwind: "$product" }, {
            $match: {

                "product.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]
    } else if (req.body.type == '1month') {
        start.setMonth(start.getMonth() - 1);
        filter = [{ $unwind: "$product" }, {
            $match: {

                "product.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]

    } else {
        start = new Date(08 / 03 / 2000)
        filter = [{ $unwind: "$product" }]

    }

    Pepper_bill.aggregate(filter).sort({ "product.date": -1, "product._id": -1 }).exec((err, data) => {

        res.render('pepperbill', {
            mainpath: '/viewbill',
            errorMessage: "",
            loads: '',
            doc: '',
            start: [],
            end: [],
            names: [],
            seller: data,
            start: start,
            end: end,

        })
    })


}
exports.editcoffeebill = (req, res) => {
    Coffee_bill.findOneAndUpdate({ _id: req.body.objectid, product: { $elemMatch: { _id: req.body.arrayid } } }, {

                $set: {

                    'product.$.date': req.body.editdate,
                    'product.$.category': req.body.edittype,
                    'product.$.numberofsack': req.body.editbags,
                    'product.$.totalkg': req.body.totalkgedit,
                    'product.$.price_perbag': req.body.editprize,
                    'product.$.total': req.body.edittotal,
                    'product.$.autumn': req.body.autumn,
                    'product.$.moisture': req.body.moisture,
                    'product.$.paid': req.body.editpaid,
                    'product.$.balance': req.body.balancepayment,

                }
            }, // list fields you like to change
            { 'new': true, 'safe': true, 'upsert': true })
        .then(docs => {
            res.redirect('/coffeebill')
        })
}
exports.editpepperpurchase = (req, res) => {
    Pepper_bill.findOneAndUpdate({ _id: req.body.objectid, product: { $elemMatch: { _id: req.body.arrayid } } }, {

                $set: {

                    'product.$.date': req.body.editdate,
                    'product.$.category': req.body.edithint,
                    'product.$.numberofsack': req.body.editbags,
                    'product.$.totalkg': req.body.totalkgedit,
                    'product.$.market': req.body.editprize,
                    'product.$.total': req.body.edittotal,
                    'product.$.paid': req.body.editpaid,
                    'product.$.balance': req.body.balancepayment,

                }
            }, // list fields you like to change
            { 'new': true, 'safe': true, 'upsert': true })
        .then(docs => {
            res.redirect('/pepperbill')
        })
}
exports.deletecoffeebill = (req, res) => {

    Coffee_bill.findOne({ _id: req.params.objectid }).then((docs, err) => {
        docs.updateOne({
                $pull: {
                    "product": {
                        _id: req.params.id
                    }
                }
            }, { safe: true, upsert: true },
            function(err, model) {
                res.redirect('/coffeebill')

            }
        )

    }).catch(err => {
        console.log(err)

    })



}
exports.deletepepperbill = (req, res) => {

    Pepper_bill.findOne({ _id: req.params.objectid }).then((docs, err) => {
        docs.updateOne({
                $pull: {
                    "product": {
                        _id: req.params.id
                    }
                }
            }, { safe: true, upsert: true },
            function(err, model) {
                res.redirect('/pepperbill')

            }
        )

    }).catch(err => {
        console.log(err)

    })



}