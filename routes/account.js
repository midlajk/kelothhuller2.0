const path = require('path');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const accountController = require('../controller/account');
router.get('/addlorirent', accountController.addlorirent);
router.post('/addlorirent', accountController.postaddlorirent);

module.exports = router;