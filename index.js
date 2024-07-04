const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // React app URL
    methods: ["GET", "POST"],
  },
});
const messagesFilePath = path.join(__dirname, "messages.json");

const saveMessages = (messages) => {
  fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2));
};

const loadMessages = () => {
  if (fs.existsSync(messagesFilePath)) {
    const data = fs.readFileSync(messagesFilePath, "utf8");
    return JSON.parse(data);
  }
  return [];
};

const PORT = 4000;

app.use(cors());

app.get("/messages", (req, res) => {
  const messages = loadMessages();
  res.json(messages);
});

io.on("connection", (socket) => {
  console.log("new client connected");

  socket.on("sendMessage", (message) => {
    const messages = loadMessages();
    messages.push(message);
    saveMessages(messages);
    io.emit("receiveMessage", message);
    console.log({ message });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
