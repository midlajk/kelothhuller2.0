require('../model/employeemodel')
require('../model/accountsmodal')
const mongoose = require('mongoose');
const Employees = mongoose.model('Employees');
const Payments = mongoose.model('Payments');
var fs = require('fs');

    /* -------next ----- */
exports.salary = (req, res) => {
    let payment = req.flash('payment');
    if (payment.length > 0) {
        payment = payment[0];
    } else {
        payment = false;
    }
    Employees.aggregate([{ $unwind: "$detail" }]).sort({ "detail.date": -1, "detail._id": -1 }).exec((err, data) => {

            Employees.find().distinct('name').then(borrevers => {
                res.render('salary', {
                    mainpath: '/salary',
                    docs: data,
                    individual: false,
                    borrevers: borrevers,
                    filter: false,
                    payment: payment

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
            Employees.find().distinct('name').then(borrevers => {
                res.render('salary', {
                    mainpath: '/salary',
                    docs: data,
                    start: start,
                    end: end,
                    individual: false,
                    borrevers: borrevers,
                    filter: true,
                    payment: payment

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
       
            Employees.find().distinct('name').then(borrevers => {
                res.render('salary', {
                    mainpath: '/salary',
                    docs: data,
                    individual: true,
                    borrevers: borrevers,
                    filter: false,
                    id: name,
                    payment: payment

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
                    payment: payment
                })
            })

    })

}
exports.salaryform = (req, res) => {

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
    Employees.findOne({ name: name }).then(docs => {
        console.log(amount)

        if (docs) {
            console.log(docs)
            docs.updateOne({
                    $push: {
                        "detail": {
                            _id: arrayid,
                            date: date,
                            hint: req.body.hint,
                            paid: amount,
                            salary: req.body.salary||0,


                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    if (req.body.amount != 0) {
                        var paymentmanagent = new Payments({


                            name: name,
                            _id: arrayid,
                            hint: req.body.hint,
                            amount: paymentamount,
                            relation: 'Employee',
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
                  

                }
            )
        } else {
            req.flash('error', "No employye named " + name + "f ound please add profile first")
            res.redirect('/employee/Editemployee')


        }

    }).catch(err => {
        console.log(err)
    })


    function returnpage() {

        if (req.body.type == 'individual') {
            req.flash('payment', false)
            res.redirect('/paymentcontroller/indivdualsalary/' + name)
        }else if (req.body.type == "paymentpage") {
            req.flash("recieved", false)
            res.redirect('/getpayments')
        }else if(req.body.type == "recievedpage"){
            req.flash("recieved", true)
            res.redirect('/getpayments')
        } else {
            req.flash('payment', false)
            res.redirect('/paymentcontroller/salary')
        }
        

    }
}

exports.deletesalary = (req, res) => {
    var name
    Employees.findOne({name:req.params.name}).then((docs, err) => {
        if(docs){
        name = docs.name
        docs.updateOne({
                $pull: {
                    "detail": {
                        _id: req.params.arrayid
                    }
                }
            }, { safe: true, upsert: true },
            function(err, model) {
               


            }
        )
        } 
        Payments.findByIdAndDelete(req.params.arrayid).then((err, docs) => {

                })

    }).then(docs => {
    
        if (req.params.section == 'salarymanage') {
            req.flash('payment', false)
            res.redirect('/paymentcontroller/salary')
        }else if (req.params.type == "payments") {
            req.flash("recieved", false)
            res.redirect('/getpayments')
        } else if (req.params.type == "recieved") {
            req.flash("recieved", true)
            res.redirect('/getpayments')
        } else {
            req.flash('payment', false)
            res.redirect('/paymentcontroller/indivdualsalary/' + name)

        }
    })



}
