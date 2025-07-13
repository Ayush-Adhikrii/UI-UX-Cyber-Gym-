const express = require('express');
const router = express.Router();
const { createMembership, updateMembership, getCurrentMembership, getMembershipHistory } = require('../controller/membershipController');

router.post('/add', createMembership);
router.put('/update', updateMembership);
router.get('/:clientId/current', getCurrentMembership);
router.get('/:clientId/history', getMembershipHistory);

module.exports = router;