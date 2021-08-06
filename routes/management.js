const path = require('path');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const managementController = require('../controller/management');

router.get('/accountmanagement', managementController.accountmanagement);
router.get('/salesmanagement', managementController.salesmanagement);
router.get('/purchasemanagement', managementController.purchasemanagement);
router.get('/individualaccounts', managementController.individualaccounts);
router.post('/detailedbuyerdata', managementController.postdetailedbuyerdata);
router.post('/buyerform', managementController.postbuyerform);
router.get('/individualpurchase/:id', managementController.individualpurchase);
router.get('/individualsales/:id', managementController.individualsales);
router.post('/updateindividualsales', managementController.updateindividualsales);
router.post('/updateindividualpuchase', managementController.updateindividualpuchase);
router.post('/filtrsales', managementController.filtrsales);
router.get('/adduser', managementController.adduser);
router.post('/adduser', managementController.postadduser);

router.get('/utility', managementController.utility);
router.post('/utilityform', managementController.utilityform);
module.exports = router;