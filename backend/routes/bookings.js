const express = require('express');
const Booking = require('../models/Booking');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s-]{10,15}$/;
const GENDERS = ['Male', 'Female', 'Other'];
const PACKAGES = ['Bronze', 'Silver', 'Gold', 'Platinum'];

// POST /api/bookings   (login required)
router.post('/', requireAuth, async (req, res) => {
  try {
    const b = req.body || {};

    const name = String(b.name || '').trim();
    const email = String(b.email || '').trim().toLowerCase();
    const phone = String(b.phone || '').trim();
    const age = Number(b.age);
    const gender = String(b.gender || '');
    const pkg = String(b.package || '');
    const departure = new Date(b.departure);
    const returnDate = new Date(b.returnDate);
    const destinations = Array.isArray(b.destinations)
      ? [
          ...new Set(
            b.destinations
              .map((d) => String(d).trim().slice(0, 60))
              .filter(Boolean)
          ),
        ]
      : [];

    const fail = (message) => res.status(400).json({ message });

    if (!name || name.length > 80) return fail('Please enter your full name');
    if (!EMAIL_RE.test(email)) return fail('Please enter a valid email');
    if (!PHONE_RE.test(phone)) return fail('Please enter a valid phone number');
    if (!Number.isInteger(age) || age < 1 || age > 120) {
      return fail('Please enter a valid age');
    }
    if (!GENDERS.includes(gender)) return fail('Please select your gender');
    if (!PACKAGES.includes(pkg)) return fail('Please select a package');
    if (Number.isNaN(departure.getTime()) || Number.isNaN(returnDate.getTime())) {
      return fail('Please enter valid departure and return dates');
    }
    if (departure.getTime() < Date.now() - 60 * 1000) {
      return fail('Departure date must be in the future');
    }
    if (returnDate <= departure) {
      return fail('Return date must be after the departure date');
    }
    if (destinations.length < 1 || destinations.length > 12) {
      return fail('Please choose between 1 and 12 destinations');
    }

    const booking = await Booking.create({
      user: req.userId,
      name,
      email,
      phone,
      age,
      gender,
      departure,
      returnDate,
      destinations,
      package: pkg,
    });

    res.status(201).json({
      message: 'Booking received! Our travel experts will contact you within 24 hours.',
      booking,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/bookings/mine   (login required) - the logged-in user's bookings
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId }).sort({
      createdAt: -1,
    });
    res.json({ total: bookings.length, results: bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
