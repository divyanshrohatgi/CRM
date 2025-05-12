const mongoose = require('mongoose');
require('dotenv').config();
const Customer = require('./models/customer.model');

async function updateMissingStatus() {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await Customer.updateMany(
    { status: { $exists: false } },
    { $set: { status: 'Active' } }
  );
  console.log(`Updated ${result.modifiedCount} customers to have status 'Active'.`);
  await mongoose.disconnect();
}

updateMissingStatus().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 