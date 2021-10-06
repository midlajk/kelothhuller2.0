const path = require('path');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const mainController = require('../controller/main');

router.get('/', mainController.mainpage);
router.get('/login', mainController.loginpage);
router.post('/login', mainController.postloginpage);

module.exports = router;
