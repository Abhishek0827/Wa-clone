require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user'); // Adjust path if needed

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const usersArray = [
  { name: "Abhishek", mobile: 8920452793 },
  { name: "Riya", mobile: 9998887777 },
  { name: "Raj", mobile: 8887776666 },
  { name: "Meera", mobile: 7776665555 },
  { name: "Aman", mobile: 6665554444 }
];

const insertUsers = async () => {
  await connectDB();

  try {
    // Step 1: Insert users
    const insertedUsers = await User.insertMany(usersArray);
    console.log('✅ Users inserted.');

    // Step 2: Add ALL other user IDs as contacts
    const updates = insertedUsers.map(async (user) => {
      const contacts = insertedUsers
        .filter(u => u._id.toString() !== user._id.toString())
        .map(u => u._id);

      user.contacts = contacts;
      return user.save();
    });

    await Promise.all(updates);
    console.log('✅ Each user now has the other 4 users as contacts.');

    // Step 3: Print all users with populated contacts
    const allUsers = await User.find().populate('contacts', 'name mobile');
    console.log(JSON.stringify(allUsers, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

insertUsers();