const socket = io();
let countdownInterval;
let totalSeconds = 0;
let isPaused = false;

function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);

socket.on("update-timer", (data) => {
  document.getElementById("title").textContent = data.title;
  document.getElementById("speaker").textContent = data.speaker;
  document.getElementById("speech").textContent = data.speech;

  totalSeconds = parseInt(data.minutes) * 60 + parseInt(data.seconds);
  isPaused = false;
  clearInterval(countdownInterval);
  runTimer();
});

function runTimer() {
  countdownInterval = setInterval(() => {
    if (!isPaused && totalSeconds > 0) {
      const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
      const sec = String(totalSeconds % 60).padStart(2, "0");
      document.getElementById("timer").textContent = `${min}:${sec}`;
      totalSeconds--;
    }
    if (totalSeconds <= 0) {
      clearInterval(countdownInterval);
      document.getElementById("timer").textContent = "WAKTU HABIS!";
    }
  }, 1000);
}

socket.on("pause-timer", () => {
  isPaused = true;
});

socket.on("resume-timer", () => {
  isPaused = false;
});

socket.on("send-message", (msg) => {
  document.getElementById("message").textContent = msg;
});

socket.on("clear-message", () => {
  document.getElementById("message").textContent = "";
});

socket.on("reset-viewer", () => {
  document.getElementById("title").textContent = "";
  document.getElementById("speaker").textContent = "";
  document.getElementById("speech").textContent = "";
  document.getElementById("message").textContent = "";
  document.getElementById("timer").textContent = "00:00";
  clearInterval(countdownInterval);
});
