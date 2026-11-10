const MODES = {
  focus: { label: "Focus", seconds: 25 * 60 },
  break: { label: "Break", seconds: 5 * 60 },
};

const RING = 2 * Math.PI * 52;

const timeEl = document.querySelector("#time");
const modeLabelEl = document.querySelector("#mode-label");
const statusEl = document.querySelector("#status");
const progressEl = document.querySelector(".ring-progress");
const startBtn = document.querySelector("#start");
const pauseBtn = document.querySelector("#pause");
const resetBtn = document.querySelector("#reset");
const modeButtons = document.querySelectorAll(".mode");

let mode = "focus";
let remaining = MODES.focus.seconds;
let running = false;
let finished = false;
let endAt = 0;
let timerId = null;
let audioCtx = null;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function render() {
  const total = MODES[mode].seconds;
  const ratio = total === 0 ? 0 : remaining / total;

  timeEl.textContent = formatTime(remaining);
  modeLabelEl.textContent = `Tryb ${MODES[mode].label}`;
  progressEl.style.strokeDashoffset = String(RING * (1 - ratio));
  document.body.dataset.mode = mode;
  document.title = `${formatTime(remaining)} · ${MODES[mode].label}`;

  modeButtons.forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  startBtn.disabled = running || remaining === 0;
  pauseBtn.disabled = !running;

  if (finished) {
    statusEl.textContent = "Czas minął";
  } else if (running) {
    statusEl.textContent = "Odliczanie w toku";
  } else if (remaining < total) {
    statusEl.textContent = "Wstrzymano";
  } else {
    statusEl.textContent = "Gotowy do startu";
  }
}

function stopTicking() {
  clearInterval(timerId);
  timerId = null;
  running = false;
}

function syncRemaining() {
  remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));
}

function finish() {
  stopTicking();
  remaining = 0;
  finished = true;
  render();
  chime();
}

function tick() {
  syncRemaining();
  if (remaining <= 0) {
    finish();
    return;
  }
  render();
}

function start() {
  if (running || remaining <= 0) return;
  finished = false;
  endAt = Date.now() + remaining * 1000;
  running = true;
  timerId = setInterval(tick, 200);
  render();
}

function pause() {
  if (!running) return;
  syncRemaining();
  stopTicking();
  render();
}

function reset() {
  stopTicking();
  remaining = MODES[mode].seconds;
  finished = false;
  render();
}

function selectMode(nextMode) {
  if (!MODES[nextMode] || nextMode === mode) return;
  stopTicking();
  mode = nextMode;
  remaining = MODES[mode].seconds;
  finished = false;
  render();
}

function chime() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  audioCtx = audioCtx || new AudioContext();
  const now = audioCtx.currentTime;
  [523.25, 659.25].forEach((frequency, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = frequency;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02 + index * 0.18);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45 + index * 0.18);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now + index * 0.18);
    osc.stop(now + 0.5 + index * 0.18);
  });
}

startBtn.addEventListener("click", start);
pauseBtn.addEventListener("click", pause);
resetBtn.addEventListener("click", reset);
modeButtons.forEach((button) => {
  button.addEventListener("click", () => selectMode(button.dataset.mode));
});

document.addEventListener("visibilitychange", () => {
  if (running && document.visibilityState === "visible") tick();
});

render();
