const socket = io();
let countdownInterval;
let totalSeconds = 0;
let isPaused = localStorage.getItem("isPaused") === "true";
let lastTimerData = JSON.parse(localStorage.getItem("lastTimerData"));
let lastRemainingSeconds = parseInt(
  localStorage.getItem("remainingSeconds") || "0"
);

// Update jam real-time di bagian atas
function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);

// Jika sebelumnya ada data timer yang belum selesai
if (lastTimerData && lastRemainingSeconds > 0) {
  setTimerDisplay(lastTimerData);
  totalSeconds = lastRemainingSeconds;
  runTimer();
}

// Menerima data baru dari controller
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

// Fungsi menjalankan countdown
function runTimer() {
  clearInterval(countdownInterval);
  const timerEl = document.getElementById("timer");

  countdownInterval = setInterval(() => {
    if (!isPaused && totalSeconds > 0) {
      const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
      const sec = String(totalSeconds % 60).padStart(2, "0");
      timerEl.textContent = `${min}:${sec}`;

      // Tambahkan animasi berkedip jika < 1 menit
      if (totalSeconds < 60) {
        timerEl.classList.add("timer-warning");
      } else {
        timerEl.classList.remove("timer-warning");
      }

      totalSeconds--;
      localStorage.setItem("remainingSeconds", totalSeconds.toString());
    }

    if (totalSeconds <= 0) {
      clearInterval(countdownInterval);
      document.getElementById("timer").textContent = "Selesai";
      document.getElementById("timer").classList.remove("timer-warning");
      localStorage.setItem("remainingSeconds", "0");
    }
  }, 1000);
}

// Menampilkan data awal saat timer dikirim
function setTimerDisplay(data) {
  document.getElementById("title").textContent = data.title;
  document.getElementById("speaker").textContent = data.speaker;
  document.getElementById("speech").textContent = data.speech;
}

// Pause/resume
socket.on("pause-timer", () => {
  isPaused = true;
  localStorage.setItem("isPaused", "true");
});

socket.on("resume-timer", () => {
  isPaused = false;
  localStorage.setItem("isPaused", "false");
});

// Menerima pesan khusus dari controller
socket.on("send-message", (msg) => {
  const messageBox = document.getElementById("message-box");
  const messageEl = document.getElementById("message");
  const leftPanel = document.querySelector(".left-panel");

  messageEl.textContent = msg;
  messageBox.classList.remove("hidden");
  leftPanel.classList.add("message-active");
});

socket.on("clear-message", () => {
  const messageBox = document.getElementById("message-box");
  const leftPanel = document.querySelector(".left-panel");

  messageBox.classList.add("hidden");
  leftPanel.classList.remove("message-active");
});

// Reset viewer
socket.on("reset-viewer", () => {
  document.getElementById("title").textContent = "";
  document.getElementById("speaker").textContent = "";
  document.getElementById("speech").textContent = "";
  document.getElementById("message").textContent = "";
  document.getElementById("timer").textContent = "00:00";
  document.getElementById("clock").textContent = "";
  document.getElementById("timer").classList.remove("timer-warning");

  clearInterval(countdownInterval);
  totalSeconds = 0;

  document.querySelector(".left-panel").classList.remove("message-active");
  document.getElementById("message-box").classList.add("hidden");

  localStorage.removeItem("lastTimerData");
  localStorage.removeItem("remainingSeconds");
  localStorage.setItem("isPaused", "false");
});
