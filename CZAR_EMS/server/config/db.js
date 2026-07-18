require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../model/userModel');
const Holiday = require('../model/holiday');


const connectToDB = async () => {
  try {
    // Use Atlas connection string from .env, fallback to local for development
    // const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ems";
    console.log("Connecting to MongoDB...",process.env.MONGODB_URI);
    const mongoUri = process.env.MONGODB_URI ;

    // const mongoUri = "mongodb://127.0.0.1:27017/ems";
    console.log("mongoUri : ", mongoUri);
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (atlasError) {
    console.error('❌ MongoDB Atlas connection error:', atlasError.message);
    console.log('🔄 Attempting to connect to local MongoDB...');
    // try {
    //   await mongoose.connect(mongoUri);
    //   console.log('✅ Connected to local MongoDB successfully');
    // } catch (localError) {
    //   console.error('❌ Local MongoDB connection error:', localError.message);
    //   console.log('💡 Ensure MongoDB is installed and running locally, or whitelist your IP in Atlas.');
    //   process.exit(1);
    // }
  }
};

const createDefaultAdmin = async () => {
  const adminCount = await User.countDocuments({ role: 'admin' });
  if (adminCount === 0) {
    const hashedPassword = await bcrypt.hash('12345', 12);
    const user = await new User({
      name: 'Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin'
    }).save();

    // Also create in Admin model
    const Admin = require('../model/adminModel');
    await new Admin({
      userId: user._id,
      name: 'Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      phone: '',
      department: 'HR',
      isActive: true,
    }).save();

    console.log('✅ Default admin created: email : admin@test.com, password : 12345');
  }
};

const addSampleHolidays = async () => {
  const holidayCount = await Holiday.countDocuments();
  if (holidayCount === 0) {
    await Holiday.insertMany([
      { name: 'New Year\'s Day', date: new Date('2024-01-01'), year: 2024 },
      { name: 'Independence Day', date: new Date('2024-08-15'), year: 2024 },
      { name: 'Gandhi Jayanti', date: new Date('2024-10-02'), year: 2024 },
      { name: 'Christmas', date: new Date('2024-12-25'), year: 2024 },
      { name: 'Diwali', date: new Date('2024-11-01'), year: 2024 }
    ]);
    console.log('✅ Sample holidays added');
  }
};


const createDefaultEmployee = async () => {
  const User = require('../model/userModel');
  const Employee = require('../model/employeeModel');

  const empCount = await User.countDocuments({ role: 'employee' });
  if (empCount === 0) {
    const hashedPassword = await bcrypt.hash('12345', 12);
    const user = await new User({
      name: 'test emp',
      email: 'employee@test.com',
      password: hashedPassword,
      role: 'employee'
    }).save();

    await new Employee({
      userId: user._id,
      employeeId: 1,
      name: 'test emp',
      personalEmail: 'employee@personal.com',
      workEmail: 'employee@test.com',
      department: 'IT',
      role: 'Employee',
      dateOfJoining: new Date(),
      allocatedLeaves: 20,
      availableLeaves: 20,
      salary: 50000,
      position: 'Software Developer'
    }).save();

    console.log('Default employee created: email : employee@test.com, password : 12345');
  }
};

module.exports = { createDefaultAdmin, createDefaultEmployee, addSampleHolidays, connectToDB };