const express = require('express');
const router = express.Router();
const { addGym, getGyms, updateGym, deleteGym, loginGym, getUserProfile } = require('../controller/gymController');

router.post('/', addGym);
router.get('/gyms', getGyms);
router.put('/profile', updateGym);
router.get('/profile', getUserProfile);
router.get('/login', loginGym);
router.delete('/gyms/:id', deleteGym);

module.exports = router;
