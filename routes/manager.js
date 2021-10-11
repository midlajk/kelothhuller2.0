const path = require('path');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const isManager = require('../middleware/is-manager');

const managercontroller = require('../controller/managercontroller');

router.get('/addlorirent',isManager, managercontroller.Lorirent);
router.post('/addlorirent',isManager, managercontroller.postLorirent);
module.exports = router;