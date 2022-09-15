const path = require('path');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const isAdmin = require('../middleware/is-admin');
const sallarycontroller = require('../controller/salary');

router.get('/salary',isAdmin, sallarycontroller.salary);
router.post('/salary',isAdmin, sallarycontroller.salaryform);
router.get('/indivdualsalary/:id',isAdmin, sallarycontroller.indivdualsalary);
router.get('/deletesalary/:name/:arrayid/:section',isAdmin, sallarycontroller.deletesalary);
router.post('/filtersalary',isAdmin, sallarycontroller.filtersalary);
router.post('/indivdualsalaryfilter',isAdmin, sallarycontroller.indivdualsalaryfilter);
module.exports = router;