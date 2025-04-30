const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use("/controller", express.static(__dirname + "/controller"));
app.use("/viewer", express.static(__dirname + "/viewer"));
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.send("Silakan buka /controller atau /viewer");
});

io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("update-timer", (data) => {
    io.emit("update-timer", data);
  });

  socket.on("send-message", (message) => {
    io.emit("send-message", message);
  });

  socket.on("clear-message", () => {
    io.emit("clear-message");
  });

  socket.on("reset-viewer", () => {
    io.emit("reset-viewer");
  });
});

server.listen(3000, () => {
  console.log("Controller: http://localhost:3000/controller");
  console.log("Viewer: http://localhost:3000/viewer");
});
