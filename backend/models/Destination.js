const mongoose = require('mongoose');

const CATEGORIES = ['beaches', 'mountains', 'cities', 'islands', 'adventure'];

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    country: { type: String, required: true, trim: true },
    flag: { type: String, default: '' },
    description: { type: String, required: true },
    image: { type: String, required: true },
    days: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }, // in INR
    rating: { type: Number, min: 0, max: 5, default: 0 },
    badge: { type: String, default: '' },
    badgeColor: { type: String, default: 'primary' }, // Bootstrap color name
    categories: [{ type: String, enum: CATEGORIES }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Destination', destinationSchema);
