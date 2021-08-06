const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sellers = new Schema({
    name: String,
    deal: [{
        orderid: String,
        date: Date,
        bags: Number,
        kilogram: Number,
        price: Number,
        total: Number,
        paid: Number,
        remaining: Number

    }]
});

var Sellers =
    mongoose.model('Sellers', sellers);
module.exports = Sellers;


var buyers = new Schema({
    name: String,
    deal: [{
        orderid: String,
        date: Date,
        bags: Number,
        kilogram: Number,
        price: Number,
        total: Number,
        paid: Number,
        remaining: Number

    }]
});

var Buyers =
    mongoose.model('Buyers', buyers);
module.exports = Buyers;


var buyerspayment = new Schema({
    name: String,
    total: Number,
    paid: [{
        date: Date,
        order: String,
        amount: Number,
        agent: String,
        category: String,
        typee: String,
        message: String,
        remaining: Number

    }],
    payment: [{
        date: Date,
        amount: Number,
        order: String,
        typee: String,
        message: String,
    }]
});

var Buyerspayment =
    mongoose.model('Buyerspayment', buyerspayment);
module.exports = Buyerspayment;

var sellerp = new Schema({
    name: String,
    total: Number,
    paid: [{
        date: Date,
        order: String,
        amount: Number,
        agent: String,
        category: String,
        typee: String,
        message: String,
        remaining: Number

    }],
    payment: [{
        date: Date,
        amount: Number,
        order: String,
        typee: String,
        message: String,
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
    trips:[{
        date:Date,
        loadto:String,
        product:String,
        driver:String,
        rent:Number,
    }],
    paid:[{
        date:Date,
        amount:Number,
        paymentto:String,
        content:String
    }]
   
});

var Lorirent =
    mongoose.model('Lorirent', lorirent);
module.exports = Lorirent;

var utility = new Schema({
    name: String,
   detail:[{
       date:Date,
       payment:String,
       amount:Number

   }]
});

var Utility =
    mongoose.model('Utility', utility);
    module.exports = Utility;