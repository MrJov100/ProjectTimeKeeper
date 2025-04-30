const socket = io();

let timerList = [];

let sessionCountdown;

socket.on("current-session", (session) => {
  document.getElementById("sessTitle").textContent = session.title || "-";
  document.getElementById("sessSpeaker").textContent = session.speaker || "-";
  document.getElementById("sessSpeech").textContent = session.speech || "-";
  document.getElementById("sessMessage").textContent = session.message || "-";

  clearInterval(sessionCountdown);
  let remaining = session.remainingSeconds || 0;

  sessionCountdown = setInterval(() => {
    if (remaining <= 0) {
      clearInterval(sessionCountdown);
      document.getElementById("sessTime").textContent = "00:00";
      return;
    }
    const min = String(Math.floor(remaining / 60)).padStart(2, "0");
    const sec = String(remaining % 60).padStart(2, "0");
    document.getElementById("sessTime").textContent = `${min}:${sec}`;
    remaining--;
  }, 1000);
});

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

  // Validasi: Judul dan Nama Pembicara wajib diisi
  if (!title || !speaker) {
    alert("Judul Timer dan Nama Pembicara wajib diisi.");
    return;
  }

  // Validasi: Timer maksimal 59:59
  if (minutes > 59 || seconds > 59) {
    alert("Timer tidak boleh lebih dari 59 menit dan 59 detik.");
    return;
  }

  // Simpan ke daftar
  timerList.push({ title, speaker, minutes, seconds, speech });
  updateTimerList();

  // Kosongkan input setelah dikirim
  document.getElementById("title").value = "";
  document.getElementById("speaker").value = "";
  document.getElementById("minutes").value = "";
  document.getElementById("seconds").value = "";
  document.getElementById("speech").value = "";
}

function sendMessage() {
  const msg = document.getElementById("message").value;
  if (!msg) return;

  socket.emit("send-message", msg);
  document.getElementById("message").value = ""; // kosongkan input
}

function clearMessage() {
  socket.emit("clear-message");
}

function resetViewer() {
  socket.emit("reset-viewer");
}

function updateTimerList() {
  const listElement = document.getElementById("timerList");
  listElement.innerHTML = ""; // Kosongkan dulu

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
}

function deleteTimer(index) {
  timerList.splice(index, 1);
  updateTimerList();
}
