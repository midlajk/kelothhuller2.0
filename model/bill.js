const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var coffee_bill = new Schema({

    seller: String,
    product: [{
        date: Date,
        category: String,
        numberofsack: Number,
        kg: [],
        totalkg:Number,
        cutting_per_bag: Number,
        moisture: Number,
        autumn: Number,
        cutting_autumn: Number,
        market: Number,
        price_perkg:Number,
        price_perbag:Number,
        paid:Number,
        monitor: String
    }]

});

var Coffee_bill =
    mongoose.model('Coffee_bill', coffee_bill);
module.exports = Coffee_bill;

var pepper_bill = new Schema({

    seller: String,
    product: [{
        date: Date,
        category: String,
        numberofsack: Number,
        kg: [],
        totalkg:Number,
        cutting_per_bag: Number,
        price_perkg:Number,
        price_perbag:Number,
        paid:Number,
        monitor: String
    }]

});

var Pepper_bill =
    mongoose.model('Pepper_bill', pepper_bill);
module.exports = Pepper_bill;