const EventSlot = require('../models/EventSlot');
const Booking = require('../models/Booking');

// @desc    Create new event slot
// @route   POST /api/slots
exports.createSlot = async (req, res) => {
  try {
    const { eventName, date, startTime, endTime, location, capacity } = req.body;

    if (!eventName || !date || !startTime || !endTime || !location || capacity === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    if (capacity < 1) {
      return res.status(400).json({ success: false, message: 'Capacity must be greater than 0.' });
    }

    const slot = await EventSlot.create({
      eventName,
      date,
      startTime,
      endTime,
      location,
      capacity
    });

    res.status(201).json({ success: true, data: slot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all event slots with availableSeats
// @route   GET /api/slots
exports.getAllSlots = async (req, res) => {
  try {
    const slots = await EventSlot.find().sort({ createdAt: -1 }).lean();

    const result = await Promise.all(
      slots.map(async (slot) => {
        const activeBookings = await Booking.countDocuments({
          slotId: slot._id,
          bookingStatus: 'Booked'
        });
        const availableSeats = Math.max(0, slot.capacity - activeBookings);
        return { ...slot, activeBookings, availableSeats };
      })
    );

    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single slot by ID
// @route   GET /api/slots/:id
exports.getSlotById = async (req, res) => {
  try {
    const slot = await EventSlot.findById(req.params.id).lean();

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Event slot not found' });
    }

    const activeBookings = await Booking.countDocuments({
      slotId: slot._id,
      bookingStatus: 'Booked'
    });
    const availableSeats = Math.max(0, slot.capacity - activeBookings);

    res.status(200).json({
      success: true,
      data: { ...slot, activeBookings, availableSeats }
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid slot ID format' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete slot (Blocked if active bookings exist)
// @route   DELETE /api/slots/:id
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await EventSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Event slot not found' });
    }

    const activeBookingsCount = await Booking.countDocuments({
      slotId: req.params.id,
      bookingStatus: 'Booked'
    });

    if (activeBookingsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete slot with ${activeBookingsCount} active booking(s). Cancel all bookings first.`
      });
    }

    await EventSlot.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Event slot deleted successfully' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid slot ID format' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
