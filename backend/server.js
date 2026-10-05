require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const destinationRoutes = require('./routes/destinations');
const authRoutes = require('./routes/auth');

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('❌ Missing MONGODB_URI or JWT_SECRET in your .env file');
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/destinations', destinationRoutes);
app.use('/api/auth', authRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
