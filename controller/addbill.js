require('../model/bill')
require('../model/accountsmodal')

const mongoose = require('mongoose');
var fs = require('fs');
const Sellers = mongoose.model('Sellers');
const Coffee_bill = mongoose.model('Coffee_bill');
const Pepper_bill = mongoose.model('Pepper_bill');
exports.addbill = (req, res) => {
    Sellers.find().distinct('name').then(sellers => {
        res.render('addbill', {
            mainpath: '/addbill',
            errorMessage: "",
            loads: '',
            doc: sellers
        })
    })


}
exports.addcoffeebill = (req, res) => {
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
    console.log("here")
    var pepperbill = new Pepper_bill({
        seller: req.body.seller,
        product: [{
            date: req.body.date,
            category: req.body.type,
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
    pepperbill.save((err, docs) => {
        console.log(docs)
        res.redirect('/addbill')
    })


}
exports.coffeebill = (req, res) => {
    Coffee_bill.aggregate([{ $unwind: "$product" }]).then(docs => {
        res.render('coffeebill', {
            mainpath: '/viewbill',
            errorMessage: "",
            loads: '',
            doc: '',
            start: [],
            end: [],
            names: [],
            seller: docs
        })

    })


}
exports.pepperbill = (req, res) => {
    Pepper_bill.aggregate([{ $unwind: "$product" }]).then(docs => {
        console.log(docs)
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