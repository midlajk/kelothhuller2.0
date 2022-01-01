require('../model/bill')
require('../model/accountsmodal')

const mongoose = require('mongoose');
var fs = require('fs');
const Sellers = mongoose.model('Sellers');
const Coffee_bill = mongoose.model('Coffee_bill');
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
exports.postaddpepperbill = (req, res) => {

    res.render('addbill', {
        mainpath: '/addbill',
        errorMessage: "",
        loads: '',
        doc: ''
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

    res.render('pepperbill', {
        mainpath: '/viewbill',
        errorMessage: "",
        loads: '',
        doc: [],
        start: [],
        end: [],
        names: [],
        seller: []
    })


}