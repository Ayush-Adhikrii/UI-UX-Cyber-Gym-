// routes/staffRoutes.js
const express = require('express');
const router = express.Router();

const { addStaff, getStaff, updateStaff, markStaffAttendance, deleteStaff, getAbsentStaffForToday } = require('../controller/staffController');

router.post('/add', addStaff);
router.get('/', getStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);
router.get('/absent', getAbsentStaffForToday);

router.post('/attendance', markStaffAttendance);

module.exports = router;