const path = require('path');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const mainController = require('../controller/addbill');

router.get('/addbill', mainController.addbill);
router.post('/addcoffeebill', mainController.addcoffeebill);
router.get('/coffeebill', mainController.coffeebill);
router.post('/filtercoffeebill', mainController.filtercoffeebill)
router.post('/filterpepperbill', mainController.filterpepperbill)
router.get('/pepperbill', mainController.pepperbill);
router.post('/addpepperbill', mainController.addpepperbill);
router.post('/editcoffeebill', mainController.editcoffeebill);
router.post('/editpepperpurchase', mainController.editpepperpurchase);
router.get('/deletecoffeebill/:objectid/:id', mainController.deletecoffeebill);
router.get('/deletepepperbill/:objectid/:id', mainController.deletepepperbill);
module.exports = router;
