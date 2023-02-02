require('../model/employeemodel')
require('../model/accountsmodal')
const mongoose = require('mongoose');
var fs = require('fs');
const Payments = mongoose.model('Payments');
const Loaderskooli = mongoose.model('Loaderskooli');
const Loaders = mongoose.model('Loaders');
const Employees = mongoose.model('Employees');
const Attendance = mongoose.model('Attendance');
const ObjectId = mongoose.Types.ObjectId;
exports.viewattendance = (req, res) => {
    var start = new Date(08 / 03 / 2000)
    var end = new Date()
    Attendance.aggregate([{
        $match: {

            "date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "date": -1 }).exec((err, docs) => {

        res.render('viewattendance', {
            mainpath: '/viewattedance',
            paths: '/employee',
            docs: docs,
            start: start,
            end: end
        })
    })

}
exports.viewattendancefilter = (req, res) => {
    start = new Date(req.body.sdate);
    end = new Date(req.body.edate);
    Attendance.aggregate([{
        $match: {

            "date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "date": -1 }).exec((err, docs) => {

        res.render('viewattendance', {
            mainpath: '/viewattedance',
            paths: '/employee',
            docs: docs,
            start: start,
            end: end
        })
    })

}
exports.viewattendanceperson = (req, res) => {

    var start = new Date(08 / 03 / 2000)
    var end = new Date()
    Employees.aggregate([{
        $match: {
            "name": req.params.id
        }
    }, { $unwind: "$leave" }, {
        $match: {

            "leave.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "leave.date": -1 }).exec((err, docs) => {

        res.render('viewindividualattendance', {
            mainpath: '/viewattedance',
            paths: '/employee',
            docs: docs,
            start: start,
            end: end,
            name: req.params.id
        })
    })

}
exports.viewattendanceindividual = (req, res) => {
    start = new Date(req.body.sdate);
    end = new Date(req.body.edate);
    Employees.aggregate([{
        $match: {
            "name": req.body.id
        }
    }, { $unwind: "$leave" }, {
        $match: {

            "leave.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "leave.date": -1 }).exec((err, docs) => {

        res.render('viewindividualattendance', {
            mainpath: '/viewattedance',
            paths: '/employee',
            docs: docs,
            start: start,
            end: end,
            name: req.body.id
        })
    })

}
exports.Editemployee = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    Employees.aggregate([{
        $addFields: {
            totalsalary: { $sum: "$detail.salary" },
            totalpaid: { $sum: "$detail.paid" },
        }
    }]).sort({ "_id": -1 }).exec((err, docs) => {

        res.render('Editemployee', {
            mainpath: '/editemployee',
            docs: docs,
            errorMessage: message
        })
    })

}
exports.PostEditemployee = (req, res) => {

    name = req.body.names.toUpperCase().trim()
    Employees.findOne({ name: name }).then(docs => {
        if (docs) {
            Employees.findByIdAndUpdate(req.body.objectid).then(docs => {
                docs.name = name;
                docs.phone = req.body.number;
                docs.place = req.body.place;
                docs.careoff = req.body.careof;
                docs.duty = req.body.duty;
                docs.salary = req.body.salary;
                docs.save()
            }).then(docs => {
                req.flash('error', "successfully editted")
                return res.redirect('/employee/Editemployee')
            })
        } else {
            req.flash('error', "user doesnt exist")
            return res.redirect('/employee/Editemployee')

        }
    })



}
exports.deleteemployee = (req, res) => {

    Employees.findOne({ _id: req.params.id }).then(docs => {
        if (docs) {

            docs.detail.forEach(one => {

                Payments.findOneAndDelete({ _id: one._id }).then((err, docs) => {

                })
            });
        }
    }).then(docs => {
        Employees.findOneAndDelete({ _id: req.params.id }).then((err, docs) => {
            res.redirect('/employee/Editemployee')
        })

    })



}
exports.postaddemployee = (req, res) => {
    value = 0;
    name = req.body.name.toUpperCase().trim()
    Employees.findOne({ name: name }).then(docs => {
        if (docs) {
            req.flash('error', "user already exist")
            res.redirect('/employee/Editemployee')
        } else {
            var employee = new Employees({

                name: name,
                phone: req.body.number,
                place: req.body.place,
                careoff: req.body.careof,
                duty: req.body.duty,
                salary: req.body.salary,

            })
            employee.save((ree, doc) => {
                req.flash('error', "successfully added")
                res.redirect('/employee/Editemployee')
            })

        }
    })

}
exports.markattendance = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    Employees.find().then(docs => {
        res.render('markattendance', {
            mainpath: '/markattendance',
            docs: docs,
            errorMessage: message,
        })
    })

}
exports.postmarkattendance = (req, res) => {
    date = new Date(req.body.sdate)

    Attendance.findOne({ sdate: req.body.sdate }).then(docs => {

        if (docs) {
            req.flash('error', "Already marked attendance of " + req.body.sdate)
            res.redirect('/employee/markattendance')
        } else {
            var attendance = new Attendance({
                sdate: req.body.sdate,
                date: date,
                name: req.body.list

            })
            attendance.save((ree, doc) => {
                name = req.body.list;
                if (Array.isArray(name)) {
                    for (i = 0; i < name.length; i++) {
                        var names = name[i].toUpperCase().trim()
                        Employees.findOne({ name: names }).then(docs => {
                            if (docs) {
                                docs.updateOne({

                                        $push: {
                                            "leave": {
                                                date: date,
                                            }
                                        }
                                    }, { safe: true, upsert: true },
                                    function(err, model) {

                                    }
                                )
                            }
                        })
                    }
                } else {
                    var names = name.toUpperCase().trim()
                    Employees.findOne({ name: names }).then(docs => {
                        if (docs) {


                            docs.updateOne({

                                    $push: {
                                        "leave": {
                                            date: date,
                                        }
                                    }
                                }, { safe: true, upsert: true },
                                function(err, model) {

                                }
                            )
                        }
                    })
                }
                req.flash('error', "Successfully marked the attendance of " + req.body.sdate)
                res.redirect('/employee/markattendance')
            })

        }

    })


}
exports.addkooli = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    Loaders.find().then(docs => {
        Loaderskooli.find().distinct('seller').then(loads => {
            res.render('addkooli', {
                doc: docs,
                mainpath: '/addkooli',
                errorMessage: message,
                loads: loads
            })
        })
    })

}
exports.postaddkooli = (req, res) => {

    const arrayid = new mongoose.Types.ObjectId()
    let arrProps = Object.entries(req.body);
    s = process(0);
    var workers
    var seller = req.body.seller.toUpperCase().trim()


    function process(index) {
        if (index < (arrProps.length)) {
            // Call the callback once you complete execution of doStuff
            doStuff(arrProps[index], () => process(index + 1));
        } else {

            Loaderskooli.findOne({ seller: seller }).then(docs => {

                if (docs) {

                    docs.updateOne({
                            $push: {
                                "order": {
                                    _id: arrayid,
                                    product: req.body.type,
                                    total: (req.body.kooli * req.body.bags),
                                    kooli: (req.body.kooli * req.body.bags) / workers,
                                    numberofsack: req.body.bags,
                                    workers: workers,
                                    loaders: req.body.workername,
                                    date: req.body.date,
                                    monitor: req.session.user.name
                                }
                            }
                        }, { safe: true, upsert: true },
                        function(err, model) {

                        })
                } else {
                    var loaderskooli = new Loaderskooli({
                        seller: seller,
                        order: [{
                            _id: arrayid,
                            product: req.body.type,
                            total: (req.body.kooli * req.body.bags),
                            kooli: (req.body.kooli * req.body.bags) / workers,
                            numberofsack: req.body.bags,
                            workers: workers,
                            loaders: req.body.workername,
                            date: req.body.date,
                            monitor: req.session.user.name
                        }]
                    })
                    loaderskooli.save((err, data) => {

                    })
                }

            }).then(docs => {
                req.flash('error', "Data added! Date : " + req.body.date + ",  Seller : " + seller + ", Bag : " + req.body.bags + ", Kooli : " + req.body.kooli + ", workers : [ " + req.body.workername + " ]")
                res.redirect('/employee/addkooli')
            }).catch(err => {})



        }
    }

    function doStuff(props, callback) {

        if (props[0] == 'workername' && Array.isArray(props[1])) {
            workers = props[1].length
            var kooli = (req.body.kooli * req.body.bags) / workers;
            let arrProp = props[1]
            s = proces(0);

            function proces(index) {
                if (index < (arrProp.length)) {
                    // Call the callback once you complete execution of doStuff
                    doStuffs(arrProp[index], () => proces(index + 1));
                } else {}
            }

            function doStuffs(prop, callback) {
                var name = prop.toUpperCase();
                Loaders.findOne({ name: name }).then(docs => {

                    if (docs) {
                        docs.updateOne({
                                $push: {
                                    "work": {
                                        _id: arrayid,
                                        product: req.body.type,
                                        kooli: kooli,
                                        numberofsack: parseInt(req.body.bags / workers),
                                        workers: workers,
                                        loadof: seller,
                                        date: req.body.date,
                                        monitor: req.session.user.name
                                    }
                                }
                            }, { safe: true, upsert: true },
                            function(err, model) {

                            })
                    } else {
                        var loaders = new Loaders({
                            name: name,
                            work: [{
                                _id: arrayid,
                                product: req.body.type,
                                kooli: kooli,
                                numberofsack: parseInt(req.body.bags / workers),
                                workers: workers,
                                loadof: seller,
                                date: req.body.date,
                                monitor: req.session.user.name
                            }]
                        })
                        loaders.save((err, data) => {

                        })
                    }
                }).catch(err => {
                    console.log(err)
                })
                callback()
            }


        } else if (props[0] == 'workername') {
            workers = 1
            var kooli = (req.body.kooli * req.body.bags) / workers;
            var name = props[1].toUpperCase();
            Loaders.findOne({ name: name }).then(docs => {
                if (docs) {
                    docs.updateOne({
                            $push: {
                                "work": {
                                    _id: arrayid,
                                    product: req.body.type,
                                    kooli: kooli,
                                    numberofsack: parseInt(req.body.bags / workers),
                                    workers: workers,
                                    loadof: seller,
                                    date: req.body.date,
                                    monitor: req.session.user.name
                                }
                            }
                        }, { safe: true, upsert: true },
                        function(err, model) {

                        })
                } else {
                    var loaders = new Loaders({
                        name: name,
                        work: [{
                            _id: arrayid,
                            product: req.body.type,
                            kooli: kooli,
                            numberofsack: parseInt(req.body.bags / workers),
                            workers: workers,
                            loadof: seller,
                            date: req.body.date,
                            monitor: req.session.user.name
                        }]
                    })
                    loaders.save((err, data) => {

                    })
                }
            })

        } else {


        }
        callback()

    }
}
exports.viewkooli = (req, res) => {
    var start = new Date()
    var end = new Date()
    start.setDate(0);
    Loaderskooli.aggregate([{ $unwind: "$order" }]).sort({ "order.date": -1, "order._id": -1 }).exec((err, docs) => {
        Loaders.find().distinct('name').then(loaders => {
            Loaderskooli.find().distinct('seller').then(loads => {
                res.render('viewkooli', {
                    docs: docs,
                    mainpath: '/viewkooli',
                    start: start,
                    end: end,
                    individual: false,
                    loaders: loaders,
                    loads: loads
                })
            })
        })
    })

}
exports.koolifilter = (req, res) => {
    start = new Date(req.body.sdate);
    end = new Date(req.body.edate);
    Loaderskooli.aggregate([{ $unwind: "$order" }, {
        $match: {

            "order.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "order.date": -1, "order._id": -1 }).exec((err, docs) => {
        Loaders.find().distinct('name').then(loaders => {
            Loaderskooli.find().distinct('seller').then(loads => {
                res.render('viewkooli', {
                    docs: docs,
                    mainpath: '/viewkooli',
                    start: start,
                    end: end,
                    individual: false,
                    loaders: loaders,
                    loads: loads
                })
            })
        })
    })

}
exports.individualloads = (req, res) => {
    var start = new Date()
    var end = new Date()
    start.setDate(0);
    Loaderskooli.aggregate([{
        $match: {
            "seller": req.params.id
        }
    }, { $unwind: "$order" }, {
        $match: {

            "order.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "order.date": -1, "order._id": -1 }).exec((err, docs) => {
        Loaders.find().distinct('name').then(loaders => {
            Loaderskooli.find().distinct('seller').then(loads => {
                res.render('viewkooli', {
                    docs: docs,
                    mainpath: '/viewkooli',
                    start: start,
                    end: end,
                    individual: true,
                    names: req.params.id,
                    loaders: loaders,
                    loads: loads
                })
            })
        })
    })

}
exports.individualloadsfilter = (req, res) => {
    start = new Date(req.body.sdate);
    end = new Date(req.body.edate);
    Loaderskooli.aggregate([{
        $match: {
            "seller": req.body.id
        }
    }, { $unwind: "$order" }, {
        $match: {

            "order.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "order.date": -1, "order._id": -1 }).exec((err, docs) => {
        Loaders.find().distinct('name').then(loaders => {
            Loaderskooli.find().distinct('seller').then(loads => {
                res.render('viewkooli', {
                    docs: docs,
                    mainpath: '/viewkooli',
                    start: start,
                    end: end,
                    individual: true,
                    names: req.body.id,
                    loaders: loaders,
                    loads: loads
                })
            })
        })
    })
}
exports.indidualkooli = (req, res) => {
    let payment = req.flash('payment');
    if (payment.length > 0) {
        payment = payment[0];
    } else {
        payment = false;
    }
    var start = new Date()
    var end = new Date()
    start.setDate(0);
    name = req.params.id.toUpperCase();
    Loaders.aggregate([{
            "$match": { "name": name }
        },
        { $unwind: "$work" }


    ]).sort({ "work.date": -1, "work._id": -1 }).exec((err, docs) => {
        Loaders.aggregate([{
                "$match": { "name": name }
            },
            { $unwind: "$payed" }
        ]).sort({ "payed.date": -1, "payed._id": -1 }).exec((err, dics) => {
            Loaders.find().distinct('name').then(loaders => {


                res.render('indidualkooli', {
                    docs: docs,
                    dics: dics,
                    mainpath: '/viewkooli',
                    names: name,
                    start: start,
                    end: end,
                    loaders: loaders,
                    payment: payment

                })

            })
        })
    })

}
exports.indidualkoolifilter = (req, res) => {
    let payment = req.flash('payment');
    if (payment.length > 0) {
        payment = payment[0];
    } else {
        payment = false;
    }
    start = new Date(req.body.sdate);
    end = new Date(req.body.edate);
    name = req.body.id
    Loaders.aggregate([{
            "$match": { "name": name }
        },
        { $unwind: "$work" }, {
            $match: {

                "work.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }


    ]).sort({ "work.date": -1, "work._id": -1 }).exec((err, docs) => {

        Loaders.aggregate([{
                "$match": { "name": name }
            },
            { $unwind: "$payed" }, {
                $match: {

                    "payed.date": {
                        $lt: end,
                        $gte: start
                    }
                }
            }


        ]).sort({ "payed.date": -1, "payed._id": -1 }).exec((err, dics) => {
            Loaders.find().distinct('name').then(loaders => {


                res.render('indidualkooli', {
                    docs: docs,
                    dics: dics,
                    mainpath: '/viewkooli',
                    names: req.body.id,
                    start: start,
                    end: end,
                    loaders: loaders,
                    payment: payment
                })

            })
        })
    })

}
exports.addloaderpayment = (req, res) => {
    name = req.body.name.toUpperCase().trim().split('-')[0];
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
    Loaders.findOne({ name: name }).then(docs => {

        if (docs) {

            docs.updateOne({
                    $push: {
                        "payed": {
                            _id: arrayid,
                            date: date,
                            amount: amount,
                            hint: req.body.hint,

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
                            relation: 'Loader',
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
        } else {
            returnpage()


        }

    })

    function returnpage() {
        if (req.body.category == 'individual') {
            req.flash('payment', true)
            res.redirect('/employee/indidualkooli/' + name)
        } else if (req.body.type == "paymentpage") {
            req.flash("recieved", false)
            res.redirect('/getpayments')
        } else if (req.body.type == "recievedpage") {
            req.flash("recieved", true)
            res.redirect('/getpayments')
        } else {
            req.flash('payment', true)
            res.redirect('/employee/loaderspayment')
        }

    }

}
exports.addloaderkooli = (req, res) => {
    name = req.body.id.toUpperCase().trim()
    date = new Date(req.body.date)
    Loaders.findOne({ name: name }).then(docs => {

        if (docs) {

            docs.updateOne({
                    $push: {
                        "work": {
                            product: req.body.hint,
                            kooli: req.body.kooli,
                            numberofsack: req.body.bags,
                            loadof: req.body.loadof,
                            date: req.body.date,
                            monitor: req.body.monitor
                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {

                })
        } else {
            var loaders = new Loaders({
                name: name,
                "work": {
                    product: req.body.hint,
                    kooli: req.body.kooli,
                    numberofsack: req.body.bags,
                    loadof: req.body.loadof,
                    date: req.body.date,
                    monitor: req.body.monitor
                }

            })
            loaders.save((err, docs) => {})
        }

    }).then(docs => {
        if (req.body.category == 'individual') {
            req.flash('payment', false)
            res.redirect('/employee/indidualkooli/' + name)
        } else {
            req.flash('payment', false)
            res.redirect('/employee/loaderspayment')
        }
    })
}
exports.deleteload = (req, res) => {

    var seller
    Loaderskooli.findById(req.params.name).then(docs => {
            seller = docs.seller
            if (docs) {

                docs.updateOne({
                        $pull: {
                            "order": {
                                _id: req.params.id,


                            }
                        }
                    }, { safe: true, upsert: true },
                    function(err, model) {

                        Loaders.find().then(docs => {
                            for (let doc of docs) {
                                doc.updateOne({
                                        $pull: {
                                            "work": {
                                                _id: req.params.id,


                                            }
                                        }
                                    }, { safe: true, upsert: true },
                                    function(err, model) {})
                            }
                        })
                    })
            } else {

            }

        })
        .then(docs => {
            if (req.params.type == 'seperate') {
                res.redirect('/employee/viewkooli')
            } else {
                res.redirect('/employee/viewkooli/' + seller)
            }
        })

}
exports.editload = (req, res) => {
    type = req.body.type;

    Loaderskooli.findOneAndUpdate({ seller: req.body.arrayid, order: { $elemMatch: { _id: req.body.objectid } } }, {

            $set: {

                'order.$.date': new Date(req.body.editdate),

            }
        }, // list fields you like to change
        { 'new': true, 'safe': true, 'upsert': true }).then(docs => {

        Loaderskooli.aggregate([{
            $match: {
                seller: req.body.arrayid
            }
        }, { $unwind: "$order" }, {
            $match: {
                "order._id": ObjectId(req.body.objectid)
            }
        }]).then(docs => {
            Loaders.updateMany({ 'work._id': req.body.objectid }, {
                '$set': {
                    'work.$.date': new Date(req.body.editdate),

                }
            }, function(err) {})


        })
    }).then(docs => {
        if (type == 'seperate') {
            res.redirect('/employee/viewkooli')
        } else {
            res.redirect('/employee/viewkooli/' + req.body.arrayid)
        }

    })

}
exports.editname = (req, res) => {
    Loaderskooli.findOneAndUpdate({
        seller: req.body.arrayid
    }).then(docs => {
        docs.seller = req.body.editname.toUpperCase().trim()
        docs.save()
    }).then(docs => {

        res.redirect('/employee/viewkooli/' + req.body.editname.toUpperCase().trim())

    }).catch(err => {
        console.log(err)
    })

}
exports.deleteloadseller = (req, res) => {

    Loaderskooli.findOneAndRemove({ seller: req.params.arrayid }).then(docs => {
        res.redirect('/employee/viewkooli')

    }).catch(err => {
        console.log(err)
        res.redirect('/employee/viewkooli')
    })

}

exports.deletepayment = (req, res) => {
    name = req.params.name.toUpperCase()
    Loaders.findOne({ name: name }).then(docs => {

        docs.updateOne({
                $pull: {
                    "payed": {
                        _id: req.params.arrayid,


                    }
                }
            }, { safe: true, upsert: true },
            function(err, model) {
                Payments.findByIdAndDelete(req.params.arrayid).then((err, docs) => {

                })


            })

    }).then(docs => {

        if (req.params.type == 'individual') {
            req.flash('payment', true)
            res.redirect('/employee/indidualkooli/' + name)
        } else if (req.params.type == "payments") {
            req.flash("recieved", false)
            res.redirect('/getpayments')
        } else if (req.params.type == "recieved") {
            req.flash("recieved", true)
            res.redirect('/getpayments')
        } else {
            req.flash('payment', true)
            res.redirect('/employee/loaderspayment')
        }

    })


}
exports.deleteindividualkooli = (req, res) => {
    name = req.params.name.toUpperCase()
    Loaders.findOne({ name: name }).then(docs => {

        docs.updateOne({
                $pull: {
                    "work": {
                        _id: req.params.arrayid,


                    }
                }
            }, { safe: true, upsert: true },
            function(err, model) {

                if (req.params.type == 'individual') {
                    req.flash('payment', false)
                    res.redirect('/employee/indidualkooli/' + name)
                } else {
                    req.flash('payment', false)
                    res.redirect('/employee/loaderspayment')
                }


            })

    }).catch(err => {
        console.log(err)
    })

}
exports.loaderspayment = (req, res) => {
    let payment = req.flash('payment');
    if (payment.length > 0) {
        payment = payment[0];
    } else {
        payment = false;
    }
    var start = new Date()
    var end = new Date()
    start.setDate(0);

    Loaders.aggregate([
        { $unwind: "$work" }, {
            $match: {

                "work.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }


    ]).sort({ "work.date": -1, "work._id": -1 }).exec((err, docs) => {

        Loaders.aggregate([
            { $unwind: "$payed" }, {
                $match: {

                    "payed.date": {
                        $lt: end,
                        $gte: start
                    }
                }
            }

        ]).sort({ "payed.date": -1, "payed._id": -1 }).exec((err, dics) => {
            Loaders.find().distinct('name').then(loaders => {

                res.render('loaderspayment', {
                    docs: docs,
                    dics: dics,
                    mainpath: '/loaderspayment',
                    start: start,
                    end: end,
                    loaders: loaders,
                    payment: payment

                })

            })
        })
    })


}
exports.filterloaderspayment = (req, res) => {
    let payment = req.flash('payment');
    if (payment.length > 0) {
        payment = payment[0];
    } else {
        payment = false;
    }
    start = new Date(req.body.sdate);
    end = new Date(req.body.edate);
    Loaders.aggregate([
        { $unwind: "$work" }, {
            $match: {

                "work.date": {
                    $lt: end,
                    $gte: start
                }
            }
        }


    ]).sort({ "work.date": -1, "work._id": -1 }).exec((err, docs) => {

        Loaders.aggregate([
            { $unwind: "$payed" }, {
                $match: {

                    "payed.date": {
                        $lt: end,
                        $gte: start
                    }
                }
            }

        ]).sort({ "payed.date": -1, "payed._id": -1 }).exec((err, dics) => {
            Loaders.find().distinct('name').then(loaders => {


                res.render('loaderspayment', {
                    docs: docs,
                    dics: dics,
                    mainpath: '/loaderspayment',

                    start: start,
                    end: end,
                    loaders: loaders,
                    payment: payment

                })

            })
        })
    })

}

exports.loaderslistfilter = (req, res) => {
    start = new Date(req.body.sdate);
    bdate = new Date(req.body.sdate);
    end = new Date(req.body.edate);
    start.setDate(start.getDate() - 1);

    Loaders.aggregate([{
            "$match": {
                "work.date": { $gte: start, $lt: end }
            }
        },
        {
            "$project": {
                "name": 1,
                "values": {
                    "$filter": {
                        "input": "$work",
                        "as": "value",
                        "cond": {
                            "$and": [
                                { "$gt": ["$$value.date", start] },
                                { "$lt": ["$$value.date", end] }
                            ]
                        }
                    }
                },
                "payment": {
                    "$filter": {
                        "input": "$payed",
                        "as": "pay",
                        "cond": {
                            "$and": [
                                { "$gt": ["$$pay.date", start] },
                                { "$lt": ["$$pay.date", end] }
                            ]
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                totalbags: { $sum: "$values.numberofsack" },
                totalamount: { $sum: "$values.kooli" },
                totalpaid: { $sum: "$payment.amount" },

            }
        }


    ]).sort({ "_id": -1 }).exec((err, data) => {
        Loaderskooli.aggregate([{
            "$match": {
                "order.date": { $gte: bdate, $lt: end }
            }
        }, { $unwind: "$order" }, { $group: { _id: "null", gross: { $sum: "$order.numberofsack" } } }]).then((datas, err) => {
            var bags
            if (datas[0]) {
                bags = datas[0].gross
            } else {
                bags = 0
            }
            res.render('loaderslist', {
                mainpath: '/loaderslist',
                docs: data,
                start: bdate,
                end: end,
                numberofsac: bags,
            })
        })
    })

}
exports.printkooli = (req, res) => {
    var start = new Date(08 / 03 / 2000)
    var end = new Date()
    Loaderskooli.aggregate([{ $unwind: "$order" }]).sort({ "order.date": -1, "order._id": -1 }).exec((err, docs) => {

        Loaders.aggregate([{
            $addFields: {
                totalbags: { $sum: "$work.numberofsack" },
                totalamount: { $sum: "$work.kooli" },
                totalpaid: { $sum: "$payed.amount" },

            }
        }]).sort({ "name": 1 }).exec((err, data) => {

            res.render('printkooli', {
                total: data,
                docs: docs,
                mainpath: '/printkooli',
                start: start,
                end: end,
                individual: false,


            })

        })
    })

}
exports.printkoolifilter = (req, res) => {
    start = new Date(req.body.sdate);
    end = new Date(req.body.edate);
    startb = new Date(req.body.sdate);
    startb.setDate(startb.getDate() - 1);

    Loaderskooli.aggregate([{ $unwind: "$order" }, {
        $match: {

            "order.date": {
                $lt: end,
                $gte: start
            }
        }
    }]).sort({ "order.date": -1, "order._id": -1 }).exec((err, docs) => {

        Loaders.aggregate([{
                "$match": {
                    "work.date": { $gte: startb, $lt: end }
                }
            },
            {
                "$project": {
                    "name": 1,
                    "values": {
                        "$filter": {
                            "input": "$work",
                            "as": "value",
                            "cond": {
                                "$and": [
                                    { "$gt": ["$$value.date", startb] },
                                    { "$lt": ["$$value.date", end] }
                                ]
                            }
                        }
                    },
                    "payment": {
                        "$filter": {
                            "input": "$payed",
                            "as": "pay",
                            "cond": {
                                "$and": [
                                    { "$gt": ["$$pay.date", startb] },
                                    { "$lt": ["$$pay.date", end] }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    totalbags: { $sum: "$values.numberofsack" },
                    totalamount: { $sum: "$values.kooli" },
                    totalpaid: { $sum: "$payment.amount" },

                }
            }


        ]).sort({ "name": 1 }).exec((err, data) => {

            res.render('printkooli', {
                total: data,
                docs: docs,
                mainpath: '/printkooli',
                start: start,
                end: end,
                individual: false,


            })
        })

    })

}
exports.indidualdailykoolifilter = (req, res) => {
    let payment = req.flash('payment');
    if (payment.length > 0) {
        payment = payment[0];
    } else {
        payment = false;
    }
    start = new Date(req.body.ndate);
    end = new Date(req.body.mdate);
    name = req.body.id
    Loaders.aggregate([{
            "$match": { "name": name }
        },
        {
            "$match": {
                "work.date": { $gte: start, $lt: end }
            }
        },

        { $unwind: "$work" },
        {
            $group: {
                _id: "$work.date",
                kooli: { $sum: "$work.kooli" },
                numberofsack: { $sum: "$work.numberofsack" }
            }
        },




    ]).sort({ "work.date": -1, "work._id": -1 }).exec((err, docs) => {
        Loaders.aggregate([{
                "$match": { "name": name }
            },
            {
                "$match": {
                    "payed.date": { $gte: start, $lt: end }
                }
            },

            { $unwind: "$payed" },
            {
                $group: {
                    _id: "$payed.date",
                    amount: { $sum: "$payed.amount" },

                }
            },

        ]).sort({ "payed.date": -1, "payed._id": -1 }).exec((err, dics) => {
            Loaders.find().distinct('name').then(loaders => {


                res.render('dailykooli', {
                    docs: docs,
                    dics: dics,
                    mainpath: '/viewkooli',
                    names: req.body.id,
                    start: start,
                    end: end,
                    loaders: loaders,
                    payment: payment
                })

            })
        })
    })

}

exports.deleteattendance = (req, res) => {
    var date = new Date(req.params.date)
    Attendance.findOne({ _id: req.params.id }).then(docs => {
        if (docs) {
            docs.name.forEach(one => {
                Employees.findOne({ name: one }).then((docs, err) => {
                    docs.updateOne({
                            $pull: {
                                "leave": {
                                    date: date
                                }
                            }
                        }, { safe: true, upsert: true },
                        function(model, err) {

                        }
                    )


                })



            });
        }
    }).then(docs => {
        Attendance.findOneAndDelete({ _id: req.params.id }).then((docs, err) => {
            res.redirect('/employee/viewattendance')
        })

    })


}