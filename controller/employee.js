require('../model/employeemodel')
require('../model/accountsmodal')
const mongoose = require('mongoose');
var fs = require('fs');
const Transaction = mongoose.model('Transaction');

const Loaderskooli = mongoose.model('Loaderskooli');
const Loaders = mongoose.model('Loaders');
const Employees = mongoose.model('Employees');
const Attendance = mongoose.model('Attendance');

exports.viewattendance = (req, res) => {
    var start = new Date()
    var end = new Date()
    end.setDate(end.getDate() + 1)
    start.setMonth(start.getMonth() - 1);
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
            docs: docs,
            start: start,
            end: end
        })
    })

}
exports.viewattendanceperson = (req, res) => {
    console.log(req.params.id)
    var start = new Date()
    var end = new Date()
    end.setDate(end.getDate() + 1)
    start.setMonth(start.getMonth() - 1);
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
        console.log(docs)
        res.render('viewindividualattendance', {
            mainpath: '/viewattedance',
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
    Employees.find().then(docs => {
        res.render('Editemployee', {
            mainpath: '/editemployee',
            docs: docs,
            errorMessage: message
        })
    })

}
exports.PostEditemployee = (req, res) => {
    name = req.body.names.toUpperCase()
    Employees.findOne({ name: name }).then(docs => {
        if (docs) {
            req.flash('error', "user already exist")
            return res.redirect('/employee/Editemployee')
        } else {
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
        }
    })



}
exports.deleteemployee = (req, res) => {


    Employees.findByIdAndDelete(req.params.id).then((err, docs) => {
        if (err) console.log(err)
        return res.redirect('/employee/Editemployee')
    })


}
exports.postaddemployee = (req, res) => {
    value = 0;
    name = req.body.name.toUpperCase()
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
                borrowed: 0,
                returned: 0
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
    console.log(date)
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
                        var names = name[i].toUpperCase()
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
                    var names = name.toUpperCase()
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
    Loaders.find().then(docs => {

        res.render('addkooli', {
            doc: docs,
            mainpath: '/addkooli'
        })
    })

}
exports.postaddkooli = (req, res) => {

    const arrayid = new mongoose.Types.ObjectId()
    let arrProps = Object.entries(req.body);
    s = process(0);
    var workers
    var seller = req.body.seller.toUpperCase()


    function process(index) {
        if (index < (arrProps.length)) {
            // Call the callback once you complete execution of doStuff
            doStuff(arrProps[index], () => process(index + 1));
        } else {
            console.log(req.body.seller.toUpperCase())
            Loaderskooli.findOne({ seller: req.body.seller.toUpperCase() }).then(docs => {

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

                        }]
                    })
                    loaderskooli.save((err, data) => {
                        if (err) console.log(err)

                    })
                }

            }).then(docs => {
                res.redirect('/employee/addkooli')
            }).catch(err => {
                console.log(err)
            })



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
                                        numberofsack: req.body.bags,
                                        workers: workers,
                                        loadof: seller,
                                        date: req.body.date,
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
                                numberofsack: req.body.bags,
                                workers: workers,
                                loadof: seller,
                                date: req.body.date,
                            }]
                        })
                        loaders.save((err, data) => {
                            if (err) console.log(err)

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
                                    numberofsack: req.body.bags,
                                    workers: workers,
                                    loadof: seller,
                                    date: req.body.date,
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
                            numberofsack: req.body.bags,
                            workers: workers,
                            loadof: seller,
                            date: req.body.date,
                        }]
                    })
                    loaders.save((err, data) => {
                        if (err) console.log(err)

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
    end.setDate(end.getDate() + 1)
    start.setMonth(start.getMonth() - 1);
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
    end.setDate(end.getDate() + 1)
    start.setMonth(start.getMonth() - 1);
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
    var start = new Date()
    var end = new Date()
    end.setDate(end.getDate() + 1)
    start.setMonth(start.getMonth() - 1);
    name = req.params.id.toUpperCase();
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

        ]).then(dics => {
            Loaders.find().distinct('name').then(loaders => {


                res.render('indidualkooli', {
                    docs: docs,
                    dics: dics,
                    mainpath: '/viewkooli',
                    names: name,
                    start: start,
                    end: end,
                    loaders: loaders,

                })

            })
        })
    })

}
exports.indidualkoolifilter = (req, res) => {
    start = new Date(req.body.sdate);
    end = new Date(req.body.edate);
    name = req.params.id
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


        ]).then(dics => {
            Loaders.find().distinct('name').then(loaders => {


                res.render('indidualkooli', {
                    docs: docs,
                    dics: dics,
                    mainpath: '/viewkooli',
                    names: name,
                    start: start,
                    end: end,
                    loaders: loaders,

                })

            })
        })
    })

}
exports.addloaderpayment = (req, res) => {
    const arrayid = new mongoose.Types.ObjectId()
    name = req.body.id.toUpperCase()
    date = new Date(req.body.date)
    Loaders.findOne({ name: name }).then(docs => {

        if (docs) {

            docs.updateOne({
                    $push: {
                        "payed": {
                            _id: arrayid,
                            date: date,
                            amount: req.body.amount,
                            hint: req.body.hint,

                        }
                    }
                }, { safe: true, upsert: true },
                function(err, model) {
                    var transaction = new Transaction({
                        id: arrayid,
                        Date: date,
                        amount: req.body.amount,
                        types: "debit",
                        comment: "payment to loader " + req.body.id,
                        paymentmode: req.body.hint,
                        debit: req.body.amount,

                    })
                    transaction.save((err, docs) => {
                        if (err) console.log(err)
                    })
                })
        } else {
            if (req.body.category == 'all') {
                res.redirect('/employee/indidualkooli/' + name)
            } else {

            }
        }

    }).then(docs => {
        res.redirect('/employee/indidualkooli/' + name)
    }).catch(err => {
        console.log(err)
    })

}
exports.deleteload = (req, res) => {
    name = req.params.name.toUpperCase()

    Loaderskooli.findOne({ seller: name }).then(docs => {

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
            res.redirect('/employee/viewkooli')
        }).catch(err => {
            console.log(err)
        })

}
exports.deletepayment = (req, res) => {
    c
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
                Transaction.findByIdAndDelete(req.params.arrayid).then((err, docs) => {

                    if (req.params.type == 'individual') {
                        res.redirect('/employee/indidualkooli/' + name)
                    } else {

                    }
                })

            })

    }).catch(err => {
        console.log(err)
    })

}