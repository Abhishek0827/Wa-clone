const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const { CronJob } = require("cron");
const https = require("https"); // fixed here
const http = require("http");
const { Server } = require("socket.io");

const processed_messages = require("./models/processed_messages");
const User = require("./models/user");

const job = new CronJob("*/14 * * * *", () => {
  https
    .get(process.env.API_URL, (res) => {
      if (res.statusCode === 200) console.log("GET request sent successfully");
      else console.log("GET request failed", res.statusCode);
    })
    .on("error", (e) => console.error("Error while sending request", e));
});

if (process.env.NODE_ENV === "production") job.start();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://wa-clone-1-njv4.onrender.com/",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  // console.log(`🔌 User connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    // console.log(`📥 ${socket.id} joined room: ${room}`);
    socket.join(room);
  });

  socket.on("leave_room", (room) => {
    socket.leave(room);
    // console.log(`🚪 ${socket.id} left room: ${room}`);
  });

  socket.on("Send_message", (data) => {
    const payload = { ...data, senderSocketId: socket.id };
    socket.to(data.room).emit("receive_message", payload);
  });

  // socket.on("message_delivered", ({ messageId, senderSocketId }) => {
  //   console.log(`📩 Delivery ack for ${messageId} to ${senderSocketId}`);
  //   io.to(senderSocketId).emit("message_delivered_ack", { messageId });

  //   // Update DB to mark delivered
  //   processed_messages
  //     // .updateOne(
  //     //   { messageId },
  //     //   { $set: { status: "delivered", deliveredAt: new Date() } }
  //     // )
  //     .updateOne(
  //       { messageId: messageId }, // find by messageId
  //       { $set: { status: "read" } } // update status
  //     )
  //     .catch(console.error);
  // });
  socket.on("message_opened", async ({ roomId, receiver }) => {
    // console.log(receiver);
    try {
      await processed_messages.updateMany(
        {
          room: roomId,
          senderId: receiver,
          status: { $ne: "read" }, // only update if not already read
        },
        { $set: { status: "read" } }
      );
      // console.log(receiver);
      // Optional: emit to the sender so they see read receipts
      io.to(roomId).emit("messages_marked_read", { receiver });
    } catch (err) {
      console.error("Error updating message status:", err);
    }
  });
});

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
connectDB();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("ok");
});

app.get("/api/accounts", async (req, res) => {
  try {
    const user = await User.find({}, { _id: 1, name: 1 });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/contacts", async (req, res) => {
  try {
    let { accountSelected } = req.query;
    const contacts = await User.findById(accountSelected).populate(
      "contacts",
      "name mobile"
    );
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/chats", async (req, res) => {
  try {
    const { roomId, receiver } = req.query;
    const updateStatus = await processed_messages.updateMany(
      { room: roomId, senderId: receiver }, // filter: room matches & receiver matches
      { $set: { status: "read" } } // update: set status to "read"
    );
    const chat = await processed_messages
      .find({ room: roomId })
      .sort({ _id: 1 });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/send-msg", async (req, res) => {
  try {
    const savedMessage = new processed_messages(req.body);
    await savedMessage.save();

    // If messageId is unique, this only updates the same message
    await processed_messages.updateOne(
      { _id: savedMessage._id },
      { $set: { status: "delivered" } }
    );

    const result = await processed_messages.findById(savedMessage._id);

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
