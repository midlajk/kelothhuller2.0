require('../model/borrow_salary')
require('../model/employeemodel')
require('../model/accountsmodal')
const mongoose = require('mongoose');
const Transaction = mongoose.model('Transaction');
const Borrowed = mongoose.model('Borrowed');
const Employees = mongoose.model('Employees');
var fs = require('fs');
exports.borrows = (req, res) => {

    Borrowed.aggregate([{ $unwind: "$detail" }]).sort({ "detail.date": -1, "detail._id": -1 }).exec((err, data) => {

        Borrowed.find().distinct('name').then(borrevers => {
            Employees.find().distinct('name').then(emp => {
                namesnew = borrevers.concat(emp);

                var uniqueSet = new Set(namesnew);
                var uniqueArr = Array.from(uniqueSet);

                res.render('borrow', {
                    mainpath: '/borrow',
                    docs: data,
                    individual: false,
                    borrevers: borrevers,
                    names: uniqueArr,
                    filter: false

                })
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
                filter: true,

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

    Borrowed.aggregate([{
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
    }]).sort({ "detail.date": -1, "detail._id": -1 }).exec((err, data) => {
        Borrowed.find().distinct('name').then(borrevers => {
            res.render('borrow', {
                mainpath: '/borrow',
                docs: data,
                start: start,
                end: end,
                individual: true,
                borrevers: borrevers,
                filter: true,
                id: req.body.id.toUpperCase()
            })
        })

    })

}
exports.borrowform = (req, res) => {
    const arrayid = new mongoose.Types.ObjectId()
    var name = req.body.billto.toUpperCase().trim()
    date = new Date(req.body.date)
    var amount
    var amounts
    var credit
    var method
    var debit
    var type
    if (req.body.type == 'credit') {
        type = "returns"
        amounts = -req.body.amount;
        amount = req.body.amount;
        debit = 0;
        credit = req.body.amount;
        debit = req.body.amount;
        method = "B.R. of"
    } else {
        type = "borrow"
        amounts = req.body.amount;
        credit = 0;
        amount = req.body.amount;
        method = "borrowal of "
        debit = req.body.amount;

    }
    Borrowed.findOne({ name: name }).then(docs => {

        if (docs) {
            docs.updateOne({
                    $push: {
                        "detail": {
                            _id: arrayid,
                            date: date,
                            payment: req.body.payment,
                            amount: amounts,
                            typee: type

                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    var transaction = new Transaction({
                        _id: arrayid,
                        Date: date,
                        amount: amount,
                        types: req.body.type,
                        comment: method + name,
                        paymentmode: "bank or cash",
                        debit: debit,
                        credit: credit,
                        section: "Borrowal"

                    })
                    transaction.save((err, doc) => {
                        if (err) console.log(err)
                        employee_check()

                    })

                }
            )
        } else {
            var borrowe = new Borrowed({
                name: name,
                detail: [{
                    _id: arrayid,
                    date: date,
                    payment: req.body.payment,
                    amount: amounts,
                    typee: req.body.type
                }]

            })
            borrowe.save((err, docs) => {
                console.log(err)
                var transaction = new Transaction({
                    _id: arrayid,
                    Date: date,
                    amount: amount,
                    types: req.body.type,
                    comment: method + name,
                    paymentmode: "bank or cash",
                    debit: debit,
                    credit: credit,
                    section: "Borrowal"

                })
                transaction.save((err, doc) => {
                    employee_check()

                })
            })

        }

    }).then(docs => {
        if (req.body.sec == 'individual') {
            res.redirect('/paymentcontroller/indivdualborrows/' + name)
        } else {
            res.redirect('/paymentcontroller/borrows')
        }

    })

    function employee_check() {
        Employees.findOne({ name: name }).then(docs => {

            if (docs) {
                if (req.body.type == 'credit') {
                    docs.updateOne({
                            $push: {
                                "borrowal": {
                                    id: arrayid,
                                    date: date,
                                    returned: amount,


                                }
                            }
                        }, { safe: true, upsert: true },
                        function(err, model) {

                        })
                } else {
                    docs.updateOne({
                            $push: {
                                "borrowal": {
                                    id: arrayid,
                                    date: date,
                                    borrowed: amount,


                                }
                            }
                        }, { safe: true, upsert: true },
                        function(err, model) {

                        })
                }
            }

        })
    }

}

exports.deleteborrow = (req, res) => {
        var name
        Borrowed.findById(req.params.objectid).then((docs, err) => {
            name = docs.name
            docs.updateOne({
                    $pull: {
                        "detail": {
                            _id: req.params.arrayid
                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {

                    Transaction.findByIdAndDelete(req.params.arrayid).then((err, docs) => {

                    })
                    Employees.findOne({ name: name }).then((docs, err) => {
                        if (docs) {
                            docs.updateOne({
                                    $pull: {
                                        "borrowal": {
                                            id: req.params.arrayid
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

        }).then(docs => {
            if (req.params.section == 'borrowmanage') {
                res.redirect('/paymentcontroller/borrows')
            } else {
                var section = req.params.section.split('_')[0];
                var name = req.params.section.split('_')[1];
                if (section == 'borrow') {
                    res.redirect('/paymentcontroller/indivdualborrows/' + name)
                } else {

                }
            }
        })



    }
    /* -------next ----- */
exports.salary = (req, res) => {
    let payment = req.flash('payment');
    if (payment.length > 0) {
        payment = payment[0];
    } else {
        payment = false;
    }
    Employees.aggregate([{ $unwind: "$detail" }]).sort({ "detail.date": -1, "detail._id": -1 }).exec((err, data) => {
        Employees.aggregate([{ $unwind: "$payment" }]).sort({ "payment.date": -1, "payment._id": -1 }).exec((err, dics) => {
            Employees.find().distinct('name').then(borrevers => {
                res.render('salary', {
                    mainpath: '/salary',
                    docs: data,
                    individual: false,
                    borrevers: borrevers,
                    filter: false,
                    dics: dics,
                    payment: payment

                })
            })

        })
    })

}
exports.filtersalary = (req, res) => {
    let payment = req.flash('payment');
    if (payment.length > 0) {
        payment = payment[0];
    } else {
        payment = false;
    }
    var start = new Date(req.body.sdate)
    var end = new Date(req.body.edate)
    console.log("here")
    Employees.aggregate([{ $unwind: "$detail" }, {
        $match: {

            "detail.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "detail.date": -1, "detail._id": -1 }).exec((err, data) => {
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
                    dics: dics,
                    payment: payment

                })
            })
        })

    })

}
exports.indivdualsalary = (req, res) => {
    let payment = req.flash('payment');
    if (payment.length > 0) {
        payment = payment[0];
    } else {
        payment = false;
    }
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
                Borrowed.fin
                res.render('salary', {
                    mainpath: '/salary',
                    docs: data,
                    individual: true,
                    borrevers: borrevers,
                    filter: false,
                    id: name,
                    dics: dics,
                    payment: payment

                })
            })
        })

    })

}
exports.indivdualsalaryfilter = (req, res) => {
    let payment = req.flash('payment');
    if (payment.length > 0) {
        payment = payment[0];
    } else {
        payment = false;
    }
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
                    dics: dics,
                    payment: payment
                })
            })
        })

    })

}
exports.salaryform = (req, res) => {

    var name = req.body.billto.toUpperCase()
    date = new Date(req.body.date)
    var amount = req.body.amount;

    const arrayid = new mongoose.Types.ObjectId()
    Employees.findOne({ name: name }).then(docs => {

        if (docs) {
            docs.updateOne({
                    $push: {
                        "detail": {
                            _id: arrayid,
                            date: date,
                            payment: req.body.payment,
                            amount: amount,


                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    var transaction = new Transaction({
                        _id: arrayid,
                        Date: req.body.date,
                        amount: amount,
                        types: "debit",
                        comment: "S.P to " + name,
                        paymentmode: "bank or cash",
                        debit: req.body.paid,
                        section: "salary"

                    })
                    transaction.save((err, doc) => {

                        if (err) console.log(err)
                        if (req.body.type == 'individual') {
                            req.flash('payment', false)
                            res.redirect('/paymentcontroller/indivdualsalary/' + name)
                        } else {
                            req.flash('payment', false)
                            res.redirect('/paymentcontroller/salary')
                        }
                    })


                }
            )
        } else {

            req.flash('error', "No employye named " + name + "f ound please add profile first")
            res.redirect('/employee/Editemployee')


        }

    }).catch(err => {
        console.log(err)
    })



}
exports.addsalary = (req, res) => {

    var name = req.body.id.toUpperCase()
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
                        req.flash('payment', true)
                        res.redirect('/paymentcontroller/indivdualsalary/' + name)
                    } else {
                        req.flash('payment', true)
                        res.redirect('/paymentcontroller/salary')
                    }

                }
            )
        } else {

            req.flash('error', "No employee named " + name + " found please add profile first")
            res.redirect('/employee/Editemployee')


        }

    }).catch(err => {
        console.log(err)
    })



}
exports.deletesalary = (req, res) => {
    var name
    Employees.findById(req.params.objectid).then((docs, err) => {
        name = docs.name
        docs.updateOne({
                $pull: {
                    "detail": {
                        _id: req.params.arrayid
                    }
                }
            }, { safe: true, upsert: true },
            function(err, model) {
                Transaction.findByIdAndDelete(req.params.arrayid).then((err, docs) => {

                })


            }
        )

    }).then(docs => {
        if (req.params.section == 'salarymanage') {
            req.flash('payment', false)
            res.redirect('/paymentcontroller/salary')
        } else {
            req.flash('payment', false)
            res.redirect('/paymentcontroller/indivdualsalary/' + name)

        }
    })



}
exports.deletesalarypayment = (req, res) => {
    var name
    Employees.findById(req.params.objectid).then((docs, err) => {
        name = docs.name
        docs.updateOne({
                $pull: {
                    "payment": {
                        _id: req.params.arrayid
                    }
                }
            }, { safe: true, upsert: true },
            function(err, model) {
                console.log(err);


            }
        )

    }).then(docs => {
        if (req.params.section == 'salarymanage') {
            req.flash('payment', true)
            res.redirect('/paymentcontroller/salary')
        } else {
            req.flash('payment', true)
            res.redirect('/paymentcontroller/indivdualsalary/' + name)



        }
    })



}