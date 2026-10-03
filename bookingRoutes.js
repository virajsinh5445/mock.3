const express = require('express');
const router = express.Router();
const { cancelBooking } = require('../controllers/bookingController');

router.patch('/:id/cancel', cancelBooking);

module.exports = router;
