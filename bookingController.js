const Booking = require('../models/Booking');
const EventSlot = require('../models/EventSlot');

// @desc    Book a slot
// @route   POST /api/slots/:id/book
exports.bookSlot = async (req, res) => {
  try {
    const { studentName, email, rollNo } = req.body;
    const slotId = req.params.id;

    if (!studentName || !email) {
      return res.status(400).json({ success: false, message: 'Student name and email are required.' });
    }

    const slot = await EventSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Event slot not found' });
    }

    if (slot.status === 'Closed') {
      return res.status(400).json({ success: false, message: 'Booking failed: This slot is closed.' });
    }

    const activeBookingsCount = await Booking.countDocuments({
      slotId,
      bookingStatus: 'Booked'
    });

    if (activeBookingsCount >= slot.capacity) {
      return res.status(400).json({ success: false, message: 'Booking failed: Slot is full.' });
    }

    const duplicateBooking = await Booking.findOne({
      slotId,
      email: email.toLowerCase().trim(),
      bookingStatus: 'Booked'
    });

    if (duplicateBooking) {
      return res.status(400).json({
        success: false,
        message: 'Booking failed: Active booking already exists for this email on this slot.'
      });
    }

    const booking = await Booking.create({
      slotId,
      studentName,
      email: email.toLowerCase().trim(),
      rollNo
    });

    res.status(201).json({ success: true, message: 'Slot booked successfully', data: booking });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid slot ID format' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all active bookings for a specific slot
// @route   GET /api/slots/:id/bookings
exports.getSlotBookings = async (req, res) => {
  try {
    const slot = await EventSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Event slot not found' });
    }

    const bookings = await Booking.find({
      slotId: req.params.id,
      bookingStatus: 'Booked'
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid slot ID format' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a booking
// @route   PATCH /api/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    booking.bookingStatus = 'Cancelled';
    await booking.save();

    res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid booking ID format' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
