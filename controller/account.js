require('../model/accountsmodal')
const mongoose = require('mongoose');
const Utility = mongoose.model('Utility');
var fs = require('fs');

const Lorirent = mongoose.model('Lorirent');
const Payments = mongoose.model('Payments');
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

/* ------------------------ */


exports.getpayments = (req, res) => {

    Payments.aggregate([{ $unwind: "$payment" }]).sort({ "payment.date": -1, "payment._id": -1 }).exec((err, data) => {
        Payments.aggregate([{ $unwind: "$paid" }]).sort({ "paid.date": -1, "paid._id": -1 }).exec((err, dics) => {
            Payments.find().distinct('name').then(names => {
                res.render('paymentmanage', {
                    mainpath: '/paymentsmanage',
                    docs: data,
                    individual: false,
                    names: names,
                    filter: false,
                    dics: dics

                })
            })

        })
    })

}
exports.filterpayments = (req, res) => {
    var start = new Date(req.body.sdate)
    var end = new Date(req.body.edate)

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
        }]).sort({ "payment.date": -1, "payment._id": -1 }).exec((err, dics) => {
            Payments.find().distinct('name').then(names => {
                res.render('paymentmanage', {
                    mainpath: '/paymentsmanage',
                    docs: data,
                    start: start,
                    end: end,
                    individual: false,
                    names: names,
                    filter: true,
                    dics: dics

                })
            })
          
        })

    })

}
exports.individualpayments = (req, res) => {
    var name = req.params.id
    Payments.aggregate([{
        $match: {
            "name": req.params.id
        }
    }, { $unwind: "$paid" }]).sort({ "paid.date": -1, "paid._id": -1 }).exec((err, data) => {
        Payments.aggregate([{
            $match: {
                "name": req.params.id
            }
        }, { $unwind: "$payment" }]).sort({ "payment.date": -1, "payment._id": -1 }).exec((err, dics) => {
            Payments.find().distinct('name').then(names => {
                res.render('paymentmanage', {
                    mainpath: '/paymentsmanage',
                    docs: data,
                 
                    individual: true,
                    names: names,
                    filter: false,
                    dics: dics

                })
            })
         
        })

    })

}
exports.filterindividualpayments = (req, res) => {
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
    }]).sort({ "paid.date": -1, "paid._id": -1 }).exec((err, data) => {
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
        }]).sort({ "payment.date": -1, "payment._id": -1 }).exec((err, dics) => {
            Payments.find().distinct('name').then(names => {
                res.render('paymentmanage', {
                    mainpath: '/paymentsmanage',
                    docs: data,
                    start: start,
                    end: end,
                    individual: true,
                    names: names,
                    filter: true,
                    dics: dics

                })
            })
        })

    })

}
exports.paidamountform = (req, res) => {

    var name = req.body.name
    date = new Date(req.body.date)
    var amount = req.body.amount;


    Payments.findOne({ name: name }).then(docs => {

        if (docs) {
            docs.updateOne({
                    $push: {
                        "payment": {
                            date: date,
                            hint: req.body.hint,
                            amount: amount,
                           

                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    if (err) console.log(err)
                   
                        res.redirect('/getpayments')
                 

                }
            )
        } else {

            var paymentmanagent = new Payments({
                name: name.toUpperCase(),
                payment: [{
                    date: date,
                    hint: req.body.hint,
                    amount: amount,
  
                }],
            })
            paymentmanagent.save((err, docs) => {
                if (err) console.log(err)
                res.redirect('/getpayments')
            })

   


        }

    }).catch(err => {
        console.log(err)
    })



}
