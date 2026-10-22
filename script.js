// ==============================
// SETTINGS
// ==============================

// Session lengths in seconds. 25 * 60 = 1500 seconds = 25 minutes.
// Constants in UPPER_SNAKE_CASE at the top of the file (see E=mc² notes).
// For quick testing, temporarily change these to something like 5 and 3.
const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

// ==============================
// STATE (values that change while the app runs)
// ==============================

// Seconds left on the current countdown.
let timeLeft = WORK_SECONDS;

// Either "work" or "break".
let mode = "work";

// Holds the id returned by setInterval, so we can stop it later.
// null means "the timer is not running".
let intervalId = null;

// Number of finished work sessions.
let sessionsCompleted = 0;

// ==============================
// GRAB ELEMENTS (once, on page load)
// ==============================

const app = document.getElementById("app");
const timerDisplay = document.getElementById("timer");
const modeLabel = document.getElementById("mode-label");
const sessionCount = document.getElementById("session-count");
const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const resetButton = document.getElementById("reset-button");

// ==============================
// HELPERS
// ==============================

// Turns a number of seconds into "MM:SS" text, e.g. 1500 -> "25:00", 65 -> "01:05".
function formatTime(totalSeconds) {
  // Whole minutes. Math.floor drops the remainder (same as the binary exercise).
  const minutes = Math.floor(totalSeconds / 60);
  // Leftover seconds after removing whole minutes (modulo again).
  const seconds = totalSeconds % 60;
  // padStart(2, "0") adds a leading zero so 5 becomes "05".
  // String(...) turns the number into a string first, since padStart is a string method.
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// Redraws everything on screen from the current state.
// One function that updates the whole display, instead of updating pieces in many places.
// This is basically what React does for you on every state change.
function render() {
  // Countdown digits
  timerDisplay.textContent = formatTime(timeLeft);

  // "Work" or "Break" label, using a ternary (see Dream Car notes)
  modeLabel.textContent = mode === "work" ? "Work" : "Break";

  // Session counter
  sessionCount.textContent = `Sessions completed: ${sessionsCompleted}`;

  // Browser tab title, so you can see the time from another tab
  document.title = `${formatTime(timeLeft)} - ${modeLabel.textContent}`;

  // Color theme: adds the "break" class in break mode, removes it in work mode.
  // classList.toggle(name, condition) adds when the condition is true, removes when false.
  app.classList.toggle("break", mode === "break");

  // Disable whichever button doesn't make sense right now.
  // intervalId !== null means the timer is running.
  const isRunning = intervalId !== null;
  startButton.disabled = isRunning;
  pauseButton.disabled = !isRunning;
}

// Switches between work and break, and resets the countdown for the new mode.
function switchMode() {
  // Count a session only when a work period finishes.
  if (mode === "work") {
    sessionsCompleted++;
  }

  // Flip the mode.
  mode = mode === "work" ? "break" : "work";

  // Load the full time for the new mode.
  timeLeft = mode === "work" ? WORK_SECONDS : BREAK_SECONDS;
}

// Runs once per second while the timer is going.
function tick() {
  // Count down one second.
  timeLeft--;

  // At zero, move on to the next mode. The timer keeps running into it.
  if (timeLeft <= 0) {
    switchMode();
  }

  // Redraw with the new values.
  render();
}

// ==============================
// BUTTON ACTIONS
// ==============================

function startTimer() {
  // Guard clause: if it's already running, do nothing.
  // Without this, each extra click would start ANOTHER interval
  // and the clock would count down 2x, 3x as fast.
  if (intervalId !== null) {
    return;
  }

  // setInterval(fn, ms) calls fn every ms milliseconds. 1000 ms = 1 second.
  // We pass tick (the function), not tick() (its result). Same as event listeners.
  // It returns an id we need later for clearInterval.
  intervalId = setInterval(tick, 1000);

  render();
}

function pauseTimer() {
  // clearInterval stops the repeating calls. timeLeft stays where it was.
  clearInterval(intervalId);

  // Mark the timer as not running.
  intervalId = null;

  render();
}

function resetTimer() {
  // Stop the timer first (same as pause).
  clearInterval(intervalId);
  intervalId = null;

  // Back to the start of a work session. Session count is kept on purpose.
  mode = "work";
  timeLeft = WORK_SECONDS;

  render();
}

// ==============================
// WIRE UP EVENTS
// ==============================

// Pass the function names without (), so they run on click, not now.
startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);
resetButton.addEventListener("click", resetTimer);

// ==============================
// FIRST DRAW
// ==============================

// Show the starting state (25:00, Work, Pause disabled) as soon as the page loads.
render();
