const path = require('path');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const isManager = require('../middleware/is-manager');
const isAdmin = require('../middleware/is-admin');
const managercontroller = require('../controller/managercontroller');

router.post('/deleteloader',isAdmin, managercontroller.deleteloader);
module.exports = router;