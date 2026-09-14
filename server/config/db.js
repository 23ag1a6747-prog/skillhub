const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set in server/.env');
  await mongoose.connect(uri);
  console.log(`[db] Connected to MongoDB -> ${mongoose.connection.name}`);
  return mongoose.connection;
}

module.exports = connectDB;
