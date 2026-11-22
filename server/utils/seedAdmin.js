const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[MongoDB Connected for Admin Seeding]');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@stockmate.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@StockMate2026';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`[Admin Seed]: Admin user (${adminEmail}) already exists.`);
      process.exit(0);
    }

    const admin = await User.create({
      name: 'System Administrator',
      email: adminEmail,
      phone: '+1-800-STOCKMATE',
      password: adminPassword,
      role: 'admin'
    });

    console.log('=============================================');
    console.log(' Admin user seeded successfully!');
    console.log(` Email: ${admin.email}`);
    console.log(` Password: ${adminPassword}`);
    console.log('=============================================');

    process.exit(0);
  } catch (error) {
    console.error('[Admin Seed Error]:', error.message);
    process.exit(1);
  }
};

seedAdmin();
