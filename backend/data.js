require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user"); // Adjust if path is different

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const usersArray = [
  { name: "Abhishek", mobile: 8920452793 },
  { name: "Riya", mobile: 9998887777 },
  { name: "Raj", mobile: 8887776666 },
  { name: "Meera", mobile: 7776665555 },
  { name: "Aman", mobile: 6665554444 },
];

const insertUsers = async () => {
  await connectDB();

  try {
    // Step 1: Insert users
    const insertedUsers = await User.insertMany(usersArray);
    console.log("✅ Users inserted.");

    // Step 2: Create consistent contactId and assign mutual contacts
    for (let i = 0; i < insertedUsers.length; i++) {
      const userA = insertedUsers[i];

      for (let j = i + 1; j < insertedUsers.length; j++) {
        const userB = insertedUsers[j];

        const idA = userA._id.toString();
        const idB = userB._id.toString();

        const contactId = idA < idB ? `${idA}_${idB}` : `${idB}_${idA}`;

        // Add B to A
        // Add B to A
        userA.contacts.push({
          user: userB._id,
          contactId,
          name: userB.name,
          mobile: userB.mobile,
        });

        // Add A to B
        userB.contacts.push({
          user: userA._id,
          contactId,
          name: userA.name,
          mobile: userA.mobile,
        });
      }
    }

    // Step 3: Save all updated users
    await Promise.all(insertedUsers.map((user) => user.save()));
    console.log("✅ Contacts added with consistent contactId.");

    // Step 4: Fetch all users with populated contacts
    const allUsers = await User.find().populate("contacts.user", "name mobile");
    console.log(JSON.stringify(allUsers, null, 2));
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

insertUsers();
