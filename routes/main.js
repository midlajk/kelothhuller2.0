const path = require('path');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const mainController = require('../controller/main');

router.get('/', mainController.mainpage);
router.get('/login', mainController.loginpage);
router.get('/dashboard', mainController.dashboard);
module.exports = router;
