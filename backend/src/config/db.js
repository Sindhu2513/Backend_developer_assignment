const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/internship_db');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default user and admin accounts if database is empty
    await seedInitialUsers();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const seedInitialUsers = async () => {
  try {
    // Dynamically require to prevent circular dependency issues
    const User = require('../models/User');
    
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('Seeding initial admin and user profiles...');
      
      const adminPassword = await bcrypt.hash('adminpassword', 10);
      const userPassword = await bcrypt.hash('userpassword', 10);

      await User.create([
        {
          name: 'Admin User',
          email: 'admin@example.com',
          password: adminPassword,
          role: 'admin'
        },
        {
          name: 'Regular User',
          email: 'user@example.com',
          password: userPassword,
          role: 'user'
        }
      ]);

      console.log('Seeding completed. Default credentials:');
      console.log('  Admin: admin@example.com / adminpassword');
      console.log('  User: user@example.com / userpassword');
    }
  } catch (error) {
    console.error(`Error seeding initial users: ${error.message}`);
  }
};

module.exports = connectDB;
