const path = require('path');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const mainList = require('../controller/list');
const isAdmin = require('../middleware/is-admin');
router.get('/dealerslist',isAdmin, mainList.dealerslist);

module.exports = router;
