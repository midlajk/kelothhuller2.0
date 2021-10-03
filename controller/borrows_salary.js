require('../model/borrow_salary')
require('../model/employeemodel')
const mongoose = require('mongoose');
const Borrowed = mongoose.model('Borrowed');
const Employees = mongoose.model('Employees');
var fs = require('fs');
exports.borrows = (req, res) => {

    Borrowed.aggregate([{ $unwind: "$detail" }]).sort({ "detail.date": -1, "detail._id": -1 }).exec((err, data) => {

        Borrowed.find().distinct('name').then(borrevers => {
            res.render('borrow', {
                mainpath: '/borrow',
                docs: data,
                individual: false,
                borrevers: borrevers,
                filter: false

            })
        })

    })

}
exports.filterborrows = (req, res) => {
    var start = new Date(req.body.sdate)
    var end = new Date(req.body.edate)

    Borrowed.aggregate([{ $unwind: "$detail" }, {
        $match: {

            "detail.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "detail.date": -1, "detail._id": -1 }).exec((err, data) => {
        Borrowed.find().distinct('name').then(borrevers => {
            res.render('borrow', {
                mainpath: '/borrow',
                docs: data,
                start: start,
                end: end,
                individual: false,
                borrevers: borrevers,

            })
        })

    })

}
exports.indivdualborrows = (req, res) => {
    var name = req.params.id.toUpperCase()
    Borrowed.aggregate([{
        $match: {
            "name": req.params.id.toUpperCase()
        }
    }, { $unwind: "$detail" }]).sort({ "detail.date": -1, "detail._id": -1 }).exec((err, data) => {
        Borrowed.find().distinct('name').then(borrevers => {
            res.render('borrow', {
                mainpath: '/borrow',
                docs: data,
                individual: true,
                borrevers: borrevers,
                filter: false,
                id: name

            })
        })

    })

}
exports.indivdualborrowsfilter = (req, res) => {
    var start = new Date(req.body.sdate)
    var end = new Date(req.body.edate)

    Borrowed.aggregate([{ $unwind: "$detail" }, {
        $match: {

            "detail.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "detail.date": -1, "detail._id": -1 }).exec((err, data) => {
        Borrowed.find().distinct('name').then(borrevers => {
            res.render('borrow', {
                mainpath: '/borrow',
                docs: data,
                start: start,
                end: end,
                individual: true,
                borrevers: borrevers,

            })
        })

    })

}
exports.borrowform = (req, res) => {

        var name = req.body.billto.toUpperCase()
        date = new Date(req.body.date)
        var amount
        if (req.body.type == 'credit') {
            amount = req.body.amount;
        } else {
            amount = -req.body.amount;
        }
        Borrowed.findOne({ name: name }).then(docs => {

            if (docs) {
                docs.updateOne({
                        $push: {
                            "detail": {
                                date: date,
                                payment: req.body.payment,
                                amount: amount,
                                type: req.body.type

                            }
                        }
                    }, { safe: true, upsert: true },
                    function(err, model) {
                        if (err) console.log(err)
                        if (req.body.type == 'individual') {
                            res.redirect('/paymentcontroller/indivdualborrows/' + name)
                        } else {
                            res.redirect('/paymentcontroller/borrows')
                        }

                    }
                )
            } else {
                var borrowe = new Borrowed({
                    name: name,
                    detail: [{
                        date: date,
                        payment: req.body.payment,
                        amount: amount,
                        typee: req.body.type
                    }]

                })
                borrowe.save((err, docs) => {
                    console.log(err)
                    res.redirect('/paymentcontroller/borrows')
                })

            }

        }).catch(err => {
            console.log(err)
        })



    }
    /* -------next ----- */
exports.salary = (req, res) => {

    Employees.aggregate([{ $unwind: "$detail" }]).sort({ "detail.date": -1, "detail._id": -1 }).exec((err, data) => {
        Employees.aggregate([{ $unwind: "$payment" }]).sort({ "payment.date": -1, "payment._id": -1 }).exec((err, dics) => {
            Employees.find().distinct('name').then(borrevers => {
                res.render('salary', {
                    mainpath: '/salary',
                    docs: data,
                    individual: false,
                    borrevers: borrevers,
                    filter: false,
                    dics: dics

                })
            })

        })
    })

}
exports.filtersalary = (req, res) => {
    var start = new Date(req.body.sdate)
    var end = new Date(req.body.edate)

    Employees.aggregate([{ $unwind: "$detail" }, {
        $match: {

            "detail.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "detail.date": -1, "detail._id": -1 }).exec((err, dics) => {
        Employees.aggregate([{ $unwind: "$payment" }, {
            $match: {

                "payment.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }]).sort({ "payment.date": -1, "payment._id": -1 }).exec((err, dics) => {
            Employees.find().distinct('name').then(borrevers => {
                res.render('salary', {
                    mainpath: '/salary',
                    docs: data,
                    start: start,
                    end: end,
                    individual: false,
                    borrevers: borrevers,
                    filter: true,
                    dics: dics

                })
            })
        })

    })

}
exports.indivdualsalary = (req, res) => {
    var name = req.params.id
    Employees.aggregate([{
        $match: {
            "name": req.params.id
        }
    }, { $unwind: "$detail" }]).sort({ "detail.date": -1, "detail._id": -1 }).exec((err, data) => {
        Employees.aggregate([{
            $match: {
                "name": req.params.id
            }
        }, { $unwind: "$payment" }]).sort({ "payment.date": -1, "payment._id": -1 }).exec((err, dics) => {
            Employees.find().distinct('name').then(borrevers => {
                res.render('salary', {
                    mainpath: '/salary',
                    docs: data,
                    individual: true,
                    borrevers: borrevers,
                    filter: false,
                    id: name,
                    dics: dics

                })
            })
        })

    })

}
exports.indivdualsalaryfilter = (req, res) => {
    var start = new Date(req.body.sdate)
    var end = new Date(req.body.edate)
    name = req.body.id
    Employees.aggregate([{
        $match: {
            "name": name
        }
    }, { $unwind: "$detail" }, {
        $match: {

            "detail.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "detail.date": -1, "detail._id": -1 }).exec((err, data) => {
        Employees.aggregate([{
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
            Employees.find().distinct('name').then(borrevers => {
                res.render('salary', {
                    mainpath: '/salary',
                    docs: data,
                    start: start,
                    end: end,
                    individual: true,
                    borrevers: borrevers,
                    filter: true,
                    id: name,
                    dics: dics
                })
            })
        })

    })

}
exports.salaryform = (req, res) => {

    var name = req.body.billto
    date = new Date(req.body.date)
    var amount = req.body.amount;


    Employees.findOne({ name: name }).then(docs => {

        if (docs) {
            docs.updateOne({
                    $push: {
                        "detail": {
                            date: date,
                            payment: req.body.payment,
                            amount: amount,


                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    if (err) console.log(err)
                    if (req.body.type == 'individual') {
                        res.redirect('/paymentcontroller/indivdualsalary/' + name)
                    } else {
                        res.redirect('/paymentcontroller/salary')
                    }

                }
            )
        } else {


            res.redirect('/paymentcontroller/salary')


        }

    }).catch(err => {
        console.log(err)
    })



}
exports.addsalary = (req, res) => {

    var name = req.body.id
    date = new Date(req.body.date)
    var amount = req.body.amount;


    Employees.findOne({ name: name }).then(docs => {

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
                    if (req.body.type == 'individual') {
                        res.redirect('/paymentcontroller/indivdualsalary/' + name)
                    } else {
                        res.redirect('/paymentcontroller/salary')
                    }

                }
            )
        } else {


            res.redirect('/paymentcontroller/salary')


        }

    }).catch(err => {
        console.log(err)
    })



}