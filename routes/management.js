const path = require('path');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const managementController = require('../controller/management');
const isAdmin = require('../middleware/is-admin');

router.get('/deletepurchase/:name/:arrayid/:type/:total/:paid',isAdmin, managementController.deletepurchase);
router.get('/salesmanagement',isAdmin, managementController.salesmanagement);
router.get('/deletesales/:name/:arrayid/:type/:total/:paid',isAdmin, managementController.deletesales);
router.get('/purchasemanagement',isAdmin, managementController.purchasemanagement);

router.post('/detailedbuyerdata',isAdmin, managementController.postdetailedbuyerdata);
router.post('/buyerform',isAdmin, managementController.postbuyerform);
router.get('/individualpurchase/:id',isAdmin, managementController.individualpurchase);
router.get('/individualsales/:id',isAdmin, managementController.individualsales);

router.post('/individualsalesfilter',isAdmin, managementController.individualsalesfilter);
router.post('/individualpurchasefilter',isAdmin, managementController.individualpurchasefilter);

router.post('/salesfilter',isAdmin, managementController.salesfilter);
router.post('/purchasefilter',isAdmin, managementController.purchasefilter);
router.get('/adduser',isAdmin, managementController.adduser);
router.post('/adduser',isAdmin, managementController.postadduser);
router.post('/postedituser',isAdmin, managementController.postedituser);
router.get('/deleteuser/:id',isAdmin, managementController.deleteuser);


router.post('/editorder',isAdmin, managementController.editorder);



//////Storage management ////
router.get('/purchasestoragemanagement',isAdmin, managementController.purchasestoragemanagement);
router.get('/salesstoragemanagement',isAdmin, managementController.salesstoragemanagement);

router.post('/addpuchasestorage',isAdmin, managementController.addpuchasestorage);
router.post('/addsalesstorage',isAdmin, managementController.addsalesstorage);
router.post('/editpurchasestorage',isAdmin, managementController.editpuchasestorage);
router.post('/editsalesstorage',isAdmin, managementController.editsalesstorage);
router.get('/deletepurchasestorage/:name/:arrayid/',isAdmin, managementController.deletepurchasestorage);
router.get('/deletesalesestorage/:name/:arrayid/',isAdmin, managementController.deletesalesestorage);

module.exports = router;