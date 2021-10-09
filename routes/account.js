const path = require('path');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const accountController = require('../controller/account');
router.get('/addlorirent', accountController.addlorirent);
router.post('/addlorirent', accountController.postaddlorirent);
router.post('/addloripayment', accountController.addloripayment);
router.post('/fliteraddlorirent', accountController.fliteraddlorirent);
router.get('/addindividuallorirent/:id', accountController.addindividuallorirent);
router.post('/fliterindividualaddlorirent', accountController.fliterindividualaddlorirent);
router.get('/deleteloarirent/:objectid/:id/:section', accountController.deleteloarirent);
router.get('/deleteloaripayment/:objectid/:id/:section', accountController.deleteloaripayment);
router.post('/filterutility', accountController.filterutility);
router.get('/indivual_utility/:id', accountController.indivual_utility);
router.get('/deleteutility/:objectid/:id/:section', accountController.deleteutility);
router.post('/filterindividualutility', accountController.filterindividualutility);
router.get('/getpayments', accountController.getpayments);
router.post('/getpayments', accountController.postpaid);
router.post('/paidamountform', accountController.paidamountform);
router.get('/individualpayments/:id', accountController.individualpayments);
router.post('/filterpayments', accountController.filterpayments);
router.post('/filterindividualpayments', accountController.filterindividualpayments);
router.get('/deletepaid/:objectid/:id/:section', accountController.deletepaid);
router.get('/deletepayment/:objectid/:id/:section', accountController.deletepayment);
module.exports = router;