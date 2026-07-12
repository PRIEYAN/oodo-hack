import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/transitops';

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ MongoDB connected');
    app.listen(PORT, () => console.log(`✓ TransitOps API on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
