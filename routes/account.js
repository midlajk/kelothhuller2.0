const path = require('path');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const isMorA = require('../middleware/is-mora');
const isAdmin = require('../middleware/is-admin');
const accountController = require('../controller/account');
router.get('/getpayments',isAdmin, accountController.getpayments);
router.post('/getpayments',isAdmin, accountController.postpaid);
router.post('/postrecieved',isAdmin, accountController.postrecieved);
router.post('/filterpayments',isAdmin, accountController.filterpayments);
router.get('/deletepaid/:relation/:id',isAdmin, accountController.deletepaid);
router.get('/deleterecieced/:relation/:id',isAdmin, accountController.deletepayment);

module.exports = router;