const express = require('express');
const { getFeesAndSalary, getYearlyProfit } = require('../controller/financeController');

const router = express.Router();

// Endpoint to get fees and salary data for a month
router.get('/fees-and-salary', getFeesAndSalary);
router.get("/profit", getYearlyProfit);


module.exports = router;