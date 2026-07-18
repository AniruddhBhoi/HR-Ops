const mongoose = require('mongoose');
const Employee = require('./server/model/employeeModel');
require('dotenv').config();

async function updateAllocatedLeaves() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/czar_ems', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Update all employees to set allocatedLeaves to 20 if not set
    const result = await Employee.updateMany(
      { allocatedLeaves: { $exists: false } }, // Only update if allocatedLeaves doesn't exist
      { $set: { allocatedLeaves: 20 } }
    );

    console.log(`Updated ${result.modifiedCount} employees`);

    // Also update availableLeaves to 20 if it's 0 or not set
    const result2 = await Employee.updateMany(
      { $or: [{ availableLeaves: { $exists: false } }, { availableLeaves: 0 }] },
      { $set: { availableLeaves: 20 } }
    );

    console.log(`Updated availableLeaves for ${result2.modifiedCount} employees`);

    process.exit(0);
  } catch (error) {
    console.error('Error updating allocatedLeaves:', error);
    process.exit(1);
  }
}

updateAllocatedLeaves();
