const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@gmail.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
