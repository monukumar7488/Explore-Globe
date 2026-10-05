require('dotenv').config();
const mongoose = require('mongoose');
const Destination = require('./models/Destination');
const destinations = require('./data/destinations');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Destination.deleteMany({});
    const created = await Destination.insertMany(destinations);
    console.log(`✅ Seeded ${created.length} destinations`);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
