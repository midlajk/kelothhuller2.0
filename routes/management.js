const path = require('path');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const managementController = require('../controller/management');
const isAdmin = require('../middleware/is-admin');
router.get('/transaction',isAdmin, managementController.getTransaction);
router.post('/filterTransaction',isAdmin, managementController.filterTransaction);
router.get('/accountmanagement',isAdmin, managementController.accountmanagement);

router.get('/deletepurchase/:objectid/:arrayid/:type/:total/:paid',isAdmin, managementController.deletepurchase);
router.get('/salesmanagement',isAdmin, managementController.salesmanagement);
router.get('/deletesales/:objectid/:arrayid/:type/:total/:paid',isAdmin, managementController.deletesales);
router.get('/purchasemanagement',isAdmin, managementController.purchasemanagement);

router.post('/detailedbuyerdata',isAdmin, managementController.postdetailedbuyerdata);
router.post('/buyerform',isAdmin, managementController.postbuyerform);
router.get('/individualpurchase/:id',isAdmin, managementController.individualpurchase);
router.get('/individualsales/:id',isAdmin, managementController.individualsales);

router.post('/individualsalesfilter',isAdmin, managementController.individualsalesfilter);
router.post('/individualpurchasefilter',isAdmin, managementController.individualpurchasefilter);

router.post('/filtrsales',isAdmin, managementController.filtrsales);
router.post('/salesfilter',isAdmin, managementController.salesfilter);
router.post('/purchasefilter',isAdmin, managementController.purchasefilter);
router.get('/adduser',isAdmin, managementController.adduser);
router.post('/adduser',isAdmin, managementController.postadduser);
router.post('/postedituser',isAdmin, managementController.postedituser);
router.get('/deleteuser/:id',isAdmin, managementController.deleteuser);
router.get('/utility',isAdmin, managementController.utility);
router.post('/utilityform',isAdmin, managementController.utilityform);

router.post('/editorder',isAdmin, managementController.editorder);

router.post('/credittransaction',isAdmin, managementController.credittransaction);
router.post('/debittransaction',isAdmin, managementController.debittransaction);
router.post('/editcredittransaction',isAdmin, managementController.editcredittransaction);
router.post('/editdebittransaction',isAdmin, managementController.editdebittransaction);
router.get('/deletetransaction/:id',isAdmin, managementController.deletetransaction);

module.exports = router;