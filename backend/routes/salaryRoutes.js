const express = require('express');
const router = express.Router();
const salaryController = require('../controller/salaryController');

router.post('/', salaryController.addOrUpdateSalary);
router.get('/:staffId/:year/:month', salaryController.getSalaryByStaffIdAndDate);
router.get('/', salaryController.getAllSalaries);

module.exports = router;