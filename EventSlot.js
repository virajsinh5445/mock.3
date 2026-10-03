const mongoose = require('mongoose');

const eventSlotSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required']
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    status: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('EventSlot', eventSlotSchema);
