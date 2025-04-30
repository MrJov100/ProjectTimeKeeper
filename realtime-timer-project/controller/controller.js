const socket = io();

let timerList = [];

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

  // Kosongkan input
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
      <br><em>${timer.speech}</em><br>
      <button onclick="startTimer(${index})">Mulai</button>
      <button onclick="deleteTimer(${index})">Hapus</button>
    `;
    listElement.appendChild(li);
  });
}

function startTimer(index) {
  const timer = timerList[index];
  socket.emit("update-timer", timer);

  // Tampilkan juga di preview dashboard
  document.getElementById("preview-title").textContent = timer.title;
  document.getElementById("preview-speaker").textContent = timer.speaker;
  document.getElementById("preview-speech").textContent = timer.speech;

  let totalSeconds = timer.minutes * 60 + timer.seconds;
  updatePreviewTimer(totalSeconds);
}

let previewInterval;
function updatePreviewTimer(totalSeconds) {
  clearInterval(previewInterval);
  previewInterval = setInterval(() => {
    if (totalSeconds <= 0) {
      clearInterval(previewInterval);
      return;
    }
    const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const sec = String(totalSeconds % 60).padStart(2, "0");
    document.getElementById("preview-timer").textContent = `${min}:${sec}`;
    totalSeconds--;
  }, 1000);
}

function deleteTimer(index) {
  timerList.splice(index, 1);
  updateTimerList();
}

function sendMessage() {
  const msg = document.getElementById("message").value.trim();
  if (!msg) return;

  socket.emit("send-message", msg);

  // Jangan ubah preview langsung di sini — biarkan viewer/dashboard menunggu emit
  document.getElementById("message").value = "";
}

function clearMessage() {
  socket.emit("clear-message");

  // Jangan ubah preview langsung — biarkan lewat socket.on
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
