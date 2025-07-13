const express = require('express');
const router = express.Router();
const { addGym, getGyms, updateGym, deleteGym, loginGym } = require('../controller/gymController');

router.post('/', addGym);
router.get('/gyms', getGyms);
router.put('/gyms/:id', updateGym);
router.get('/login', loginGym);
router.delete('/gyms/:id', deleteGym);

module.exports = router;
