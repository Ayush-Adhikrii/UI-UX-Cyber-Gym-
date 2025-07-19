const express = require('express');
const router = express.Router();
const { addGym, getGyms, updateGym, deleteGym, loginGym, getUserProfile, updatePassword, sendOtp, forgotPassword } = require('../controller/gymController');

router.post('/', addGym);
router.post('/forgot-password', forgotPassword);
router.post('/send-otp', sendOtp);
router.get('/gyms', getGyms);
router.put('/profile', updateGym);
router.get('/profile', getUserProfile);
router.get('/login', loginGym);
router.delete('/gyms/:id', deleteGym);

module.exports = router;
