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

// State session aktif
let currentSession = {
  title: "",
  speaker: "",
  speech: "",
  message: "",
  remainingSeconds: 0,
};

io.on("connection", (socket) => {
  console.log("Client connected");

  // Kirim state saat ini ke controller saat terkoneksi
  socket.emit("current-session", currentSession);

  socket.on("update-timer", (data) => {
    currentSession.title = data.title;
    currentSession.speaker = data.speaker;
    currentSession.speech = data.speech;
    currentSession.remainingSeconds =
      parseInt(data.minutes) * 60 + parseInt(data.seconds);

    io.emit("update-timer", data);
    io.emit("current-session", currentSession); // broadcast update ke controller
  });

  socket.on("send-message", (message) => {
    currentSession.message = message;
    io.emit("send-message", message);
    io.emit("current-session", currentSession);
  });

  socket.on("clear-message", () => {
    currentSession.message = "";
    io.emit("clear-message");
    io.emit("current-session", currentSession);
  });

  socket.on("reset-viewer", () => {
    currentSession = {
      title: "",
      speaker: "",
      speech: "",
      message: "",
      remainingSeconds: 0,
    };
    io.emit("reset-viewer");
    io.emit("current-session", currentSession);
  });
});

server.listen(3000, () => {
  console.log("Controller: http://localhost:3000/controller");
  console.log("Viewer: http://localhost:3000/viewer");
});
