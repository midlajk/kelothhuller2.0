const path = require('path');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const mainController = require('../controller/addbill');

router.get('/addbill', mainController.addbill);
router.post('/addcoffeebill', mainController.addcoffeebill);
router.get('/coffeebill', mainController.coffeebill);
router.get('/pepperbill', mainController.pepperbill);
module.exports = router;
