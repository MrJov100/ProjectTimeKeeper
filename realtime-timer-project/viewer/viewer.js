const socket = io();
let countdownInterval;
let totalSeconds = 0;
let isPaused = localStorage.getItem("isPaused") === "true";
let lastTimerData = JSON.parse(localStorage.getItem("lastTimerData"));
let lastRemainingSeconds = parseInt(
  localStorage.getItem("remainingSeconds") || "0"
);

function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);

// Lanjutkan timer jika data sebelumnya ada
if (lastTimerData && lastRemainingSeconds > 0) {
  setTimerDisplay(lastTimerData);
  totalSeconds = lastRemainingSeconds;
  runTimer();
}

socket.on("update-timer", (data) => {
  localStorage.setItem("lastTimerData", JSON.stringify(data));
  localStorage.setItem("isPaused", "false");

  setTimerDisplay(data);
  totalSeconds = parseInt(data.minutes) * 60 + parseInt(data.seconds);
  localStorage.setItem("remainingSeconds", totalSeconds.toString());

  isPaused = false;
  clearInterval(countdownInterval);
  runTimer();
});

function runTimer() {
  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    if (!isPaused && totalSeconds > 0) {
      const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
      const sec = String(totalSeconds % 60).padStart(2, "0");
      document.getElementById("timer").textContent = `${min}:${sec}`;
      totalSeconds--;
      localStorage.setItem("remainingSeconds", totalSeconds.toString());
    }

    if (totalSeconds <= 0) {
      clearInterval(countdownInterval);
      document.getElementById("timer").textContent = "Selesai";
      localStorage.setItem("remainingSeconds", "0");
    }
  }, 1000);
}

function setTimerDisplay(data) {
  document.getElementById("title").textContent = data.title;
  document.getElementById("speaker").textContent = data.speaker;
  document.getElementById("speech").textContent = data.speech;
}

socket.on("pause-timer", () => {
  isPaused = true;
  localStorage.setItem("isPaused", "true");
});

socket.on("resume-timer", () => {
  isPaused = false;
  localStorage.setItem("isPaused", "false");
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
  totalSeconds = 0;

  localStorage.removeItem("lastTimerData");
  localStorage.removeItem("remainingSeconds");
  localStorage.setItem("isPaused", "false");
});
