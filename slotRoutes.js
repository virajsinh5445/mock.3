const express = require('express');
const router = express.Router();
const { createSlot, getAllSlots, getSlotById, deleteSlot } = require('../controllers/slotController');
const { bookSlot, getSlotBookings } = require('../controllers/bookingController');

router.route('/')
  .post(createSlot)
  .get(getAllSlots);

router.route('/:id')
  .get(getSlotById)
  .delete(deleteSlot);

router.post('/:id/book', bookSlot);
router.get('/:id/bookings', getSlotBookings);

module.exports = router;
