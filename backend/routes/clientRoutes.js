// routes/clientRoutes.js
const express = require('express');
const router = express.Router();

const { addClient, getClients, updateClient, markAttendance, deleteClient, getAbsentClientsForToday, getDailyAttendance, getAllAttendance, getClientVisitFrequency

} = require('../controller/clientController');

router.post('/add', addClient);
router.get('/', getClients);
router.get('/all', getAllAttendance);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);
router.post('/attendance', markAttendance);
router.get('/daily-attendance', getDailyAttendance);
router.get('/absent', getAbsentClientsForToday);
router.get('/visit-frequency', getClientVisitFrequency);



module.exports = router;