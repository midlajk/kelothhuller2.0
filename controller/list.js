require('../model/accountsmodal')

const mongoose = require('mongoose');
var fs = require('fs');
const Sellers = mongoose.model('Sellers');
const Buyers = mongoose.model('Buyers');

const Users = mongoose.model('Users');
exports.dealerslist = (req, res) => {
    Buyers.aggregate( [
        {
          $addFields: {
            totalsales: { $sum: "$deal.total" } ,
            totalkg: { $sum: "$deal.kilogram" },
            totalpaid: { $sum: "$deal.paid" }
          }
        }
     ]).sort({ "_id": -1 }).exec((err, data) => {
    Sellers.aggregate([      {
        $addFields: {
          totalsales: { $sum: "$deal.total" } ,
          totalkg: { $sum: "$deal.kilogram" },
          totalpaid: { $sum: "$deal.paid" }
        }
      }]).sort({ "_id": -1 }).exec((err, dics) => {
     
    res.render('dealerslist', {
        mainpath: '/stockmanagement',
        docs:data,
        dics:dics

    })
    })
})

}