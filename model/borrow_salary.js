const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var borrowed = new Schema({
    name: String,
    detail: [{
        date: Date,
        payment: String,
        typee: String,
        amount: Number

    }]
});

var Borrowed =
    mongoose.model('Borrowed', borrowed);
module.exports = Borrowed;

