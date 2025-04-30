const socket = io();
let timerList = [];
let previewInterval;
let currentTimerIndex = null;
let isPaused = false;
let remainingSeconds = 0;

function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);

function sendTimer() {
  const title = document.getElementById("title").value.trim();
  const speaker = document.getElementById("speaker").value.trim();
  const minutes =
    parseInt(document.getElementById("minutes").value.trim()) || 0;
  const seconds =
    parseInt(document.getElementById("seconds").value.trim()) || 0;
  const speech = document.getElementById("speech").value.trim();

  if (!title || !speaker) {
    alert("Judul Timer dan Nama Pembicara wajib diisi.");
    return;
  }

  if (minutes > 59 || seconds > 59) {
    alert("Timer tidak boleh lebih dari 59 menit dan 59 detik.");
    return;
  }

  const timer = { title, speaker, minutes, seconds, speech };
  timerList.push(timer);
  updateTimerList();

  document.getElementById("title").value = "";
  document.getElementById("speaker").value = "";
  document.getElementById("minutes").value = "";
  document.getElementById("seconds").value = "";
  document.getElementById("speech").value = "";
}

function updateTimerList() {
  const listElement = document.getElementById("timerList");
  listElement.innerHTML = "";

  timerList.forEach((timer, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${timer.title}</strong> - ${timer.speaker} (${String(
      timer.minutes
    ).padStart(2, "0")}:${String(timer.seconds).padStart(2, "0")})
      <div class="scroll-box">${timer.speech}</div>
      <button onclick="startTimer(${index})">Mulai</button>
      <button onclick="pauseResumeTimer(${index})" id="pauseBtn-${index}" disabled>Pause</button>
      <button onclick="deleteTimer(${index})">Hapus</button>
    `;
    listElement.appendChild(li);
  });
}

function startTimer(index) {
  const timer = timerList[index];
  socket.emit("update-timer", timer);

  document.getElementById("preview-title").textContent = timer.title;
  document.getElementById("preview-speaker").textContent = timer.speaker;
  document.getElementById("preview-speech").textContent = timer.speech;

  clearInterval(previewInterval);
  currentTimerIndex = index;
  isPaused = false;
  remainingSeconds = timer.minutes * 60 + timer.seconds;

  document.getElementById(`pauseBtn-${index}`).disabled = false;

  updatePreviewTimer();
}

function updatePreviewTimer() {
  clearInterval(previewInterval);
  previewInterval = setInterval(() => {
    if (!isPaused && remainingSeconds > 0) {
      const min = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
      const sec = String(remainingSeconds % 60).padStart(2, "0");
      document.getElementById("preview-timer").textContent = `${min}:${sec}`;
      remainingSeconds--;
    }
    if (remainingSeconds <= 0) {
      clearInterval(previewInterval);
    }
  }, 1000);
}

function pauseResumeTimer(index) {
  if (index !== currentTimerIndex) return;

  const btn = document.getElementById(`pauseBtn-${index}`);
  if (!isPaused) {
    isPaused = true;
    btn.textContent = "Resume";
    socket.emit("pause-timer");
  } else {
    isPaused = false;
    btn.textContent = "Pause";
    socket.emit("resume-timer");
  }
}

function deleteTimer(index) {
  timerList.splice(index, 1);
  updateTimerList();
}

function sendMessage() {
  const msg = document.getElementById("message").value.trim();
  if (!msg) return;
  socket.emit("send-message", msg);
  document.getElementById("message").value = "";
}

function clearMessage() {
  socket.emit("clear-message");
}

function resetViewer() {
  socket.emit("reset-viewer");
  document.getElementById("preview-title").textContent = "";
  document.getElementById("preview-speaker").textContent = "";
  document.getElementById("preview-speech").textContent = "";
  document.getElementById("preview-timer").textContent = "00:00";
  document.getElementById("preview-message").textContent = "[Belum ada pesan]";
  document.getElementById("preview-message").classList.remove("active");
  clearInterval(previewInterval);
}

socket.on("send-message", (msg) => {
  const box = document.getElementById("preview-message");
  box.textContent = msg;
  box.classList.add("active");
});

socket.on("clear-message", () => {
  const box = document.getElementById("preview-message");
  box.textContent = "[Belum ada pesan]";
  box.classList.remove("active");
});
