const path = require('path');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const mainList = require('../controller/list');
const isAdmin = require('../middleware/is-admin');
router.get('/dealerslist',isAdmin, mainList.dealerslist);
router.post('/filterdelerslist',isAdmin, mainList.filterdelerslist);
router.post('/deletedealersales',isAdmin, mainList.deletedealersales);
router.post('/deletedealerpurchase',isAdmin, mainList.deletedealerpurchase);
router.get('/loaderslist',isAdmin, mainList.loaderslist);

module.exports = router;
