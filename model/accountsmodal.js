const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var sellers = new Schema({
    id: String,
    name: String,
    total:Number,
    deal: [{
        id: String,
        through: String,
        date: Date,
        dateadded:Date,
        bagprice:Number,
        bags: Number,
        kilogram: Number,
        price: Number,
        total: Number,
        paid:Number,
        hint: String,
    }],
    storage:[{
        date: Date,
        kilogram: Number,
        price: Number,
        product: String,
        settlementquntity:Number
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
        dateadded:Date,
        tds:Number,
        loari:String,
        date: Date,
        kilogram: Number,
        price: Number,
        total: Number,
        paid:Number,
 

    }],
    storage:[{
        date: Date,
        kilogram: Number,
        price: Number,
        product: String,
        settlementquntity:Number
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
        date:Date,
        dateadded:Date,
        name:String,
        amount:Number,
        hint:String,
        relation:String,
        category:String


});

var Payments =
    mongoose.model('Payments', payments);
    module.exports = Payments;