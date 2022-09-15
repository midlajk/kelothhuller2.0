require('../model/accountsmodal')
require('../model/employeemodel')
const mongoose = require('mongoose');
var fs = require('fs');
const Employees = mongoose.model('Employees');
const Payments = mongoose.model('Payments');
const Sellers = mongoose.model('Sellers');
const Buyers = mongoose.model('Buyers');
const managementController = require('./management');
const employeecontroller = require('./employee');
const salarycontroller = require('./salary');

const Loaders = mongoose.model('Loaders');
/* ------------------------ */


exports.getpayments = (req, res) => {
    let recieved = req.flash('recieved');
    if (recieved.length > 0) {
        recieved = recieved[0];
    } else {
        recieved = false;
    }
    Payments.find().sort({ "date": -1, "_id": -1 }).exec(async(err, data) => {
        const Buyer = await Buyers.find().distinct('name').lean();
        const Seller = await Sellers.find().distinct('name').lean();
        const Loader = await Loaders.find().distinct('name').lean();
        const Employee = await Employees.find().distinct('name').lean();


        res.render('paymentmanage', {
            mainpath: '/paymentsmanage',
            docs: data,
            individual: false,
            names: [],
            filter: false,
            dics: data,
            recieved: recieved,
            Buyers: Buyer,
            Seller: Seller,
            Loader: Loader,
            Employee: Employee

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
        }]).sort({ "payment.date": -1, "payment._id": -1 }).exec(async(err, data) => {
            const Buyer = await Buyers.find().distinct('name').lean();
            const Seller = await Sellers.find().distinct('name').lean();
            const Loader = await Payments.find().distinct('name').lean();
            const Employee = await Payments.find().distinct('name').lean();

            res.render('paymentmanage', {
                mainpath: '/paymentsmanage',
                docs: data,
                start: start,
                end: end,
                individual: false,
                names: [],
                filter: true,
                dics: dics,
                recieved: recieved,
                Buyers: Buyer,
                Seller: Seller,
                Loader: Loader,
                Employee: Employee


            })

        })

    })

}

exports.postrecieved = (req, res) => {

    var name = req.body.name.toUpperCase().trim().split('-')[0]
    date = new Date(req.body.date)
    var amount = req.body.amount;
    const arrayid = new mongoose.Types.ObjectId()

    if (req.body.relation == 'Sales') {
        req.body.id = arrayid
        req.body.category = 'recieved'
        req.body.type = "recievedpage"
        managementController.postbuyerform(req, res)
    } else if (req.body.relation == 'Purchase') {
        req.body.id = arrayid
        req.body.category = 'recieved'
        req.body.type = "recievedpage"
        managementController.postdetailedbuyerdata(req, res)

    } else if (req.body.relation == 'Employee') {
        req.body.id = arrayid
        req.body.category = 'recieved'
        req.body.type = "recievedpage"
        salarycontroller.salaryform(req, res)
    } else if (req.body.relation == 'Loader') {
        req.body.id = arrayid
        req.body.category = 'recieved'
        req.body.type = "recievedpage"
        employeecontroller.addloaderpayment(req, res)

    } else {
        var paymentmanagent = new Payments({
            name: name,
            _id: arrayid,
            hint: req.body.hint,
            amount: amount,
            relation: req.body.relation,
            date: date,
            dateadded: new Date(),
            category: 'recieved'
        })
        paymentmanagent.save((err, docs) => {
            req.flash("recieved", true)
            res.redirect('/getpayments')
        })
    }




}

exports.postpaid = (req, res) => {
    var name = req.body.name.toUpperCase().trim().split('-')[0]
    date = new Date(req.body.date)
    var amount = req.body.amount;
    const arrayid = new mongoose.Types.ObjectId()

    if (req.body.relation == 'Sales') {
        req.body.id = arrayid
        req.body.category = 'payment'
        req.body.type = "paymentpage"
        managementController.postbuyerform(req, res)
    } else if (req.body.relation == 'Purchase') {
        req.body.id = arrayid
        req.body.category = 'payment'
        req.body.type = "paymentpage"
        managementController.postdetailedbuyerdata(req, res)

    } else if (req.body.relation == 'Employee') {
        req.body.id = arrayid
        req.body.category = 'payment'
        req.body.type = "paymentpage"
        salarycontroller.salaryform(req, res)
    } else if (req.body.relation == 'Loader') {
        req.body.id = arrayid
        req.body.category = 'payment'
        req.body.type = "paymentpage"
        employeecontroller.addloaderpayment(req, res)

    } else {
        var paymentmanagent = new Payments({
            name: name,
            _id: arrayid,
            hint: req.body.hint,
            amount: amount,
            relation: req.body.relation,
            date: date,
            dateadded: new Date(),
            category: 'payment'
        })
        paymentmanagent.save((err, docs) => {
            req.flash("recieved", false)
            res.redirect('/getpayments')
        })
    }


}
exports.deletepaid = (req, res) => {
    Payments.findById(req.params.id).then((docs, err) => {

        if (req.params.relation == 'Purchase') {
            req.params.paid = docs.amount;
            req.params.total = 0;
            req.params.arrayid = req.params.id;
            req.params.type = "payments"
            req.params.name = docs.name
            managementController.deletepurchase(req, res)

        } else if (req.params.relation == 'Employee') {
            req.params.arrayid = req.params.id;
            req.params.type = "payments"
            req.params.name = docs.name
            salarycontroller.deletesalary(req, res)
        } else if (req.params.relation == 'Loader') {
            req.params.arrayid = req.params.id;
            req.params.type = "payments"
            req.params.name = docs.name
            employeecontroller.deletepayment(req, res)
        } else if (req.params.relation == 'Sales') {
            req.params.paid = docs.amount;
            req.params.total = 0;
            req.params.arrayid = req.params.id;
            req.params.type = "payments"
            req.params.name = docs.name
            managementController.deletesales(req, res)
        } else {
            Payments.findByIdAndDelete(req.params.id).then((err, docs) => {
                req.flash("recieved", false)
                res.redirect('/getpayments')
            })

        }

    })

}
exports.deletepayment = (req, res) => {

    Payments.findById(req.params.id).then((docs, err) => {

        if (req.params.relation == 'Purchase') {
            req.params.paid = docs.amount;
            req.params.total = 0;
            req.params.arrayid = req.params.id;
            req.params.type = "recieved"
            req.params.name = docs.name
            managementController.deletepurchase(req, res)

        } else if (req.params.relation == 'Employee') {
            req.params.arrayid = req.params.id;
            req.params.type = "recieved"
            req.params.name = docs.name
            salarycontroller.deletesalary(req, res)
        } else if (req.params.relation == 'Loader') {
            req.params.arrayid = req.params.id;
            req.params.type = "recieved"
            req.params.name = docs.name
            employeecontroller.deletepayment(req, res)
        } else if (req.params.relation == 'Sales') {
            req.params.paid = docs.amount;
            req.params.total = 0;
            req.params.arrayid = req.params.id;
            req.params.type = "recieved"
            req.params.name = docs.name
            managementController.deletesales(req, res)
        } else {
            Payments.findByIdAndDelete(req.params.id).then((err, docs) => {
                req.flash("recieved", true)
                res.redirect('/getpayments')
            })

        }

    })

}