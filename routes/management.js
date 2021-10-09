const path = require('path');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const managementController = require('../controller/management');
router.get('/transaction', managementController.getTransaction);
router.post('/filterTransaction', managementController.filterTransaction);
router.get('/accountmanagement', managementController.accountmanagement);

router.get('/deletepurchase/:objectid/:arrayid/:type/:total/:paid', managementController.deletepurchase);
router.get('/salesmanagement', managementController.salesmanagement);
router.get('/deletesales/:objectid/:arrayid/:type/:total/:paid', managementController.deletesales);
router.get('/purchasemanagement', managementController.purchasemanagement);

router.post('/detailedbuyerdata', managementController.postdetailedbuyerdata);
router.post('/buyerform', managementController.postbuyerform);
router.get('/individualpurchase/:id', managementController.individualpurchase);
router.get('/individualsales/:id', managementController.individualsales);

router.post('/individualsalesfilter', managementController.individualsalesfilter);
router.post('/individualpurchasefilter', managementController.individualpurchasefilter);

router.post('/filtrsales', managementController.filtrsales);
router.post('/salesfilter', managementController.salesfilter);
router.post('/purchasefilter', managementController.purchasefilter);
router.get('/adduser', managementController.adduser);
router.post('/adduser', managementController.postadduser);
router.post('/postedituser', managementController.postedituser);
router.get('/deleteuser/:id', managementController.deleteuser);
router.get('/utility', managementController.utility);
router.post('/utilityform', managementController.utilityform);

router.post('/editorder', managementController.editorder);

router.post('/credittransaction', managementController.credittransaction);
router.post('/debittransaction', managementController.debittransaction);
router.post('/editcredittransaction', managementController.editcredittransaction);
router.post('/editdebittransaction', managementController.editdebittransaction);
router.get('/deletetransaction/:id', managementController.deletetransaction);

module.exports = router;