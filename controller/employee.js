require('../model/employeemodel')
const mongoose = require('mongoose');
var fs = require('fs');
const Loaderskooli = mongoose.model('Loaderskooli');
const Loaders = mongoose.model('Loaders');
const Employees = mongoose.model('Employees');
exports.viewkooli = (req, res) => {
    Loaderskooli.aggregate([{ $unwind: "$order" }]).then(docs => {
        res.render('viewkooli', {
            docs: docs,
            mainpath: '/viewkooli'
        })
    })

}
exports.indidualkooli = (req, res) => {
    Loaders.aggregate([{
            "$match": { "name": req.params.id }
        },
        { $unwind: "$work" },


    ]).then(docs => {
        Loaders.aggregate([{
                "$match": { "name": req.params.id }
            },
            { $unwind: "$payed" },


        ]).then(dics => {
            res.render('indidualkooli', {
                docs: docs,
                dics: dics
            })
        })
    })

}
exports.viewattendance = (req, res) => {
    res.render('viewattendance', {
        mainpath: '/viewattedance'
    })
}
exports.Editemployee = (req, res) => {
    Employees.find().then(docs => {
        res.render('Editemployee', {
            mainpath: '/editemployee',
            docs: docs
        })
    })

}
exports.postaddemployee = (req, res) => {
    var employee = new Employees({

        name: req.body.name,
        phone: req.body.number,
        place: req.body.place,
        careoff: req.body.careof,
        duty: req.body.duty,
        salary: req.body.salary

    })
    employee.save((ree, doc) => {
        res.redirect('/employee/Editemployee')
    })

}
exports.markattendance = (req, res) => {
    res.render('markattendance', {
        mainpath: '/markattendance'
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
    let arrProps = Object.entries(req.body);
    s = process(0);
    var workers
    var seller = req.body.seller.toLowerCase()

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
                var name = prop.toLowerCase();
                Loaders.findOne({ name: name }).then(docs => {

                    if (docs) {
                        docs.updateOne({
                                $push: {
                                    "work": {
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
            var name = props[1].toLowerCase();
            Loaders.findOne({ name: name }).then(docs => {
                if (docs) {
                    docs.updateOne({
                            $push: {
                                "work": {
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