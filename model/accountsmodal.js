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
    mode:String,
    section:String


});

var Transaction =
    mongoose.model('Transaction', transaction);
module.exports = Transaction;
var sellers = new Schema({
    id: String,
    name: String,
    total:Number,
    deal: [{
        id: String,
        through: String,
        date: Date,
        bags: Number,
        kilogram: Number,
        price: Number,
        total: Number,
        paid:Number,
        Remaining:Number,
        outumn: String,
        moisture: String,
        hint: String,
    }]
});

var Sellers =
    mongoose.model('Sellers', sellers);
module.exports = Sellers;


var buyers = new Schema({
    id: String,
    name: String,
    total:Number,
    deal: [{
        id: String,
        hint: String,
        date: Date,
        bags: Number,
        kilogram: Number,
        price: Number,
        total: Number,
        paid:Number,
        Remaining:Number,
        outumn: String,
        moisture: String,
        through: String,

    }]
});

var Buyers =
    mongoose.model('Buyers', buyers);
module.exports = Buyers;

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
        added:String,
        monitor:String
    }],
    paid: [{
        date: Date,
        amount: Number,
        hint: String,
   
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
var payments = new Schema({
    name:String,
    payment:[{
        date:Date,
        amount:Number,
        hint:String,
        
    }],
    paid:[{
        date:Date,
        amount:Number,
        hint:String,
      
    }]


});

var Payments =
    mongoose.model('Payments', payments);
    module.exports = Payments;