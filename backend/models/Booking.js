const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 1, max: 120 },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
    departure: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    destinations: {
      type: [String],
      validate: {
        validator: (list) => list.length >= 1 && list.length <= 12,
        message: 'Choose between 1 and 12 destinations',
      },
    },
    package: {
      type: String,
      required: true,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
