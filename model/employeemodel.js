const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var loaderskooli = new Schema({

    seller: String,
    order: [{
        product: String,
        kooli: Number,
        numberofsack: Number,
        workers: Number,
        total: Number,
        loaders: [],
        date: Date,
    }]

});

var Loaderskooli =
    mongoose.model('Loaderskooli', loaderskooli);
module.exports = Loaderskooli;
var loaders = new Schema({
    name: String,
    phone: String,
    work: [{
        product: String,
        kooli: Number,
        numberofsack: Number,
        loadof: String,
        date: Date,
    }],
    payed: [{
        amount: String,
        date: Date,
        message: String
    }],

});

var Loaders =
    mongoose.model('Loaders', loaders);
module.exports = Loaders;
var employees = new Schema({

    name: String,
    phone: String,
    place: String,
    careoff: String,
    duty: String,
    salary: String


});

var Employees =
    mongoose.model('Employees', employees);
module.exports = Employees;