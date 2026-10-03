const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventSlot',
      required: [true, 'Slot ID is required']
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    rollNo: {
      type: String,
      trim: true
    },
    bookingStatus: {
      type: String,
      enum: ['Booked', 'Cancelled'],
      default: 'Booked'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
