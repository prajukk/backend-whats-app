const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/whatsapp-clone"
   ).then(() => console.log("MongoDB Connected")).catch(err => console.log(err));

const MessageSchema = new mongoose.Schema({
    sender: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", MessageSchema);

app.get("/messages", async (req, res) => {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
});

app.post("/messages", async (req, res) => {
    const { sender, message } = req.body;
    const newMessage = new Message({ sender, message });
    await newMessage.save();

    io.emit("newMessage", newMessage);
    res.status(201).json(newMessage);
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(5000, () => console.log("Server running on port 5000"));
