const express = require('express');
const mongoose = require('mongoose');
const Destination = require('../models/Destination');

const router = express.Router();

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORT_OPTIONS = {
  rating: { rating: -1, name: 1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  name: { name: 1 },
};

// GET /api/destinations?q=paris&category=cities&sort=price-asc&page=1&limit=12
router.get('/', async (req, res) => {
  try {
    const { q, category, sort = 'rating', page = 1, limit = 12 } = req.query;

    const filter = {};

    if (q && String(q).trim()) {
      const regex = new RegExp(escapeRegex(String(q).trim()), 'i');
      filter.$or = [{ name: regex }, { country: regex }, { description: regex }];
    }

    if (category) {
      filter.categories = String(category).toLowerCase();
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);

    const [results, total] = await Promise.all([
      Destination.find(filter)
        .sort(SORT_OPTIONS[sort] || SORT_OPTIONS.rating)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Destination.countDocuments(filter),
    ]);

    res.json({
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/destinations/:id
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid destination id' });
    }

    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    res.json(destination);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
