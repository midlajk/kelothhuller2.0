const path = require('path');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const isManager = require('../middleware/is-manager');
const isAdmin = require('../middleware/is-admin');
const managercontroller = require('../controller/managercontroller');

router.get('/addlorirent',isManager, managercontroller.Lorirent);
router.post('/addlorirent',isManager, managercontroller.postLorirent);
router.post('/deleteloader',isAdmin, managercontroller.deleteloader);
router.post('/deleteloari',isAdmin, managercontroller.deleteloari);
module.exports = router;