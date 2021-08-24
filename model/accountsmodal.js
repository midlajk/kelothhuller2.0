const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var transaction = new Schema({
    id: String,
    Date: Date,
    amount: Number,
    types: String,
    comment: String,
    credit: Number,
    paymentmode: String,
    debit: Number,
    mode:String


});

var Transaction =
    mongoose.model('Transaction', transaction);
module.exports = Transaction;
var sellers = new Schema({
    id: String,
    name: String,
    deal: [{
        id: String,
        orderid: String,
        date: Date,
        bags: Number,
        kilogram: Number,
        price: Number,
        total: Number,
        outumn: String,
        moisture: String,
        careoff: String,

    }]
});

var Sellers =
    mongoose.model('Sellers', sellers);
module.exports = Sellers;


var buyers = new Schema({
    id: String,
    name: String,
    deal: [{
        id: String,
        careoff: String,
        date: Date,
        bags: Number,
        kilogram: Number,
        price: Number,
        total: Number,
        outumn: String,
        moisture: String,


    }]
});

var Buyers =
    mongoose.model('Buyers', buyers);
module.exports = Buyers;


var buyerspayment = new Schema({
    id: String,
    name: String,
    total: Number,
    paid: [{
        id: String,
        date: Date,
        order: String,
        amount: Number,
        agent: String,
        message: String,
        remaining: Number,
        typee:String

    }],
    payment: [{
        id: String,
        date: Date,
        amount: Number,
        order: String,
        message: String,
        remaining: Number,
        agent: String,
        typee:String
    }]
});

var Buyerspayment =
    mongoose.model('Buyerspayment', buyerspayment);
module.exports = Buyerspayment;

var sellerp = new Schema({
    id: String,
    name: String,
    total: Number,
    paid: [{
        id: String,
        date: Date,
        order: String,
        amount: Number,
        agent: String,
        message: String,
        remaining: Number,
        typee:String
    }],
    payment: [{
        id: String,
        date: Date,
        order: String,
        amount: Number,
        agent: String,
        message: String,
        remaining: Number,
        typee:String

    }]
});

var Sellerpayment =
    mongoose.model('Sellerpayment', sellerp);
module.exports = Sellerpayment;
var users = new Schema({
    name: String,
    password: String,
    role: String,
    previlage: String,
});

var Users =
    mongoose.model('Users', users);
module.exports = Users;
var lorirent = new Schema({
    registration: String,
    trips: [{
        date: Date,
        loadto: String,
        product: String,
        driver: String,
        rent: Number,
    }],
    paid: [{
        date: Date,
        amount: Number,
        paymentto: String,
        content: String
    }]

});

var Lorirent =
    mongoose.model('Lorirent', lorirent);
module.exports = Lorirent;

var utility = new Schema({
    name: String,
    detail: [{
        date: Date,
        payment: String,
        amount: Number

    }]
});

var Utility =
    mongoose.model('Utility', utility);
module.exports = Utility;

var names = new Schema({
    name: String,
    relation: String,
    phone: Number,
    address: String,
    careoff: String,

});

var Names =
    mongoose.model('Names', names);
module.exports = Names;