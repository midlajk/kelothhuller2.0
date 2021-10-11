require('../model/accountsmodal')
require('../model/borrow_salary')
require('../model/employeemodel')
const mongoose = require('mongoose');
var fs = require('fs');
const Sellers = mongoose.model('Sellers');
const Buyers = mongoose.model('Buyers');
const Payments = mongoose.model('Payments');
const Borrowed = mongoose.model('Borrowed');
const Lorirent = mongoose.model('Lorirent');
const Loaders = mongoose.model('Loaders');
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
exports.payeelist = (req, res) => {
    Payments.aggregate( [
        {
          $addFields: {
            totalrecieved: { $sum: "$payment.amount" } ,
            totalpaid: { $sum: "$paid.amount" },
         
          }
        }
     ]).sort({ "_id": -1 }).exec((err, data) => {
 
     
    res.render('payeelist', {
        mainpath: '/paymentsmanage',
        docs:data,
     

    
    })
})

}
exports.borrowlist = (req, res) => {
    Borrowed.aggregate( [
        {
          $addFields: {
            totalborrow: { $sum: "$detail.amount" } ,
            
         
          }
        }
     ]).sort({ "_id": -1 }).exec((err, data) => {
 
     
    res.render('borrowerslist', {
        mainpath: '/borrow',
        docs:data,
     

    
    })
})

}
exports.rentlist = (req, res) => {
    Lorirent.aggregate( [
        {
          $addFields: {
            totalrent: { $sum: "$trips.rent" } ,
            totalpaid: { $sum: "$paid.amount" },
         
          }
        }
     ]).sort({ "_id": -1 }).exec((err, data) => {
 
     
    res.render('loarilist', {
        mainpath: '/addlorirent',
        docs:data,
     

    
    })
})

}
exports.loaderslist = (req, res) => {
    Loaders.aggregate( [
        {
          $addFields: {
            totalbags: { $sum: "$work.numberofsack" } ,
            totalamount: { $sum: "$work.kooli" } ,
            totalpaid: { $sum: "$payed.amount" },
         
          }
        }
     ]).sort({ "_id": -1 }).exec((err, data) => {
 
     
    res.render('loaderslist', {
        mainpath: '/loaderspayment',
        docs:data,
     

    
    })
})

}