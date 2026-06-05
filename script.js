/**
 * ============================================================
 * CHRONO STOPWATCH — script.js
 * Vanilla JavaScript | No external dependencies
 * ============================================================
 *
 * Time tracking uses performance.now() for high-resolution,
 * drift-free accuracy.  A single requestAnimationFrame loop
 * drives all display updates, preventing duplicate intervals.
 *
 * State machine:
 *   READY  ──► RUNNING ──► PAUSED ──► RUNNING
 *     ▲                       │
 *     └───────────────────────┘  (reset)
 */

'use strict';

/* ── State ─────────────────────────────────────────────────── */
let startTime   = 0;   // performance.now() timestamp when last started
let elapsedTime = 0;   // accumulated ms before the last pause
let rafId       = null; // requestAnimationFrame handle
let isRunning   = false;
let lapTimes    = [];  // array of elapsed-ms values at each lap

/* ── DOM references ────────────────────────────────────────── */
const hoursEl      = document.getElementById('hours');
const minutesEl    = document.getElementById('minutes');
const secondsEl    = document.getElementById('seconds');
const msEl         = document.getElementById('milliseconds');
const timerDisplay = document.getElementById('timerDisplay');
const statusDot    = document.getElementById('statusIndicator');
const statusLabel  = document.getElementById('statusLabel');
const lapBadge     = document.getElementById('lapBadge');
const lapCountEl   = document.getElementById('lapCount');
const lapsList     = document.getElementById('lapsList');
const lapsEmpty    = document.getElementById('lapsEmpty');
const clearBtn     = document.getElementById('clearBtn');
const startBtn     = document.getElementById('startBtn');
const pauseBtn     = document.getElementById('pauseBtn');
const lapBtn       = document.getElementById('lapBtn');

/* ── Core ticker ───────────────────────────────────────────── */

/**
 * The animation loop — runs every animation frame while the
 * stopwatch is active.  Calculates total elapsed time and
 * updates the display.
 */
function tick() {
  const now    = performance.now();
  const total  = elapsedTime + (now - startTime); // total ms
  renderTime(total);
  rafId = requestAnimationFrame(tick);
}

/* ── Controls ──────────────────────────────────────────────── */

/**
 * START — begin (or resume) timing.
 * Guards against double-starts by checking isRunning.
 */
function startStopwatch() {
  if (isRunning) return; // already running — do nothing

  startTime = performance.now();
  isRunning = true;

  rafId = requestAnimationFrame(tick);

  // Update UI state
  setStatus('running');
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  lapBtn.disabled   = false;
  timerDisplay.classList.add('running');
}

/**
 * PAUSE — freeze the display while retaining elapsed time.
 */
function pauseStopwatch() {
  if (!isRunning) return;

  // Accumulate the time that passed since the last start
  elapsedTime += performance.now() - startTime;
  isRunning = false;

  cancelAnimationFrame(rafId);
  rafId = null;

  // Update UI state
  setStatus('paused');
  startBtn.disabled = false;  // resume becomes possible
  pauseBtn.disabled = true;
  lapBtn.disabled   = true;
  timerDisplay.classList.remove('running');
}

/**
 * RESET — clear everything back to zero.
 */
function resetStopwatch() {
  // Stop the loop first
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  isRunning   = false;
  startTime   = 0;
  elapsedTime = 0;
  lapTimes    = [];

  // Reset display
  renderTime(0);
  setStatus('ready');
  timerDisplay.classList.remove('running');

  // Re-enable / disable buttons
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  lapBtn.disabled   = true;

  // Clear lap list
  lapsList.innerHTML = '';
  updateLapBadge();
  lapsEmpty.style.display  = '';
  clearBtn.style.display   = 'none';
}

/**
 * LAP — snapshot the current time and add it to the list.
 */
function recordLap() {
  if (!isRunning) return;

  // Current total elapsed ms
  const total = elapsedTime + (performance.now() - startTime);

  lapTimes.push(total);
  renderLapItem(lapTimes.length, total);
  updateLapBadge();

  // Re-evaluate fastest/slowest colouring on all items
  highlightFastestSlowest();
}

/**
 * CLEAR LAPS — wipe the lap records without stopping the watch.
 */
function clearLaps() {
  lapTimes    = [];
  lapsList.innerHTML = '';
  updateLapBadge();
  lapsEmpty.style.display = '';
  clearBtn.style.display  = 'none';
}

/* ── Rendering helpers ─────────────────────────────────────── */

/**
 * Convert a raw millisecond value to HH:MM:SS.ms parts and
 * push them into the DOM.
 * @param {number} totalMs — elapsed time in milliseconds
 */
function renderTime(totalMs) {
  const ms   = Math.floor(totalMs)  % 1000;
  const secs = Math.floor(totalMs  / 1000) % 60;
  const mins = Math.floor(totalMs  / 60000) % 60;
  const hrs  = Math.floor(totalMs  / 3600000);

  hoursEl.textContent   = pad2(hrs);
  minutesEl.textContent = pad2(mins);
  secondsEl.textContent = pad2(secs);
  msEl.textContent      = pad2(Math.floor(ms / 10)); // show centiseconds (2 digits)
}

/**
 * Format a ms value to the display string HH:MM:SS.cs
 * @param {number} ms
 * @returns {string}
 */
function formatTime(ms) {
  const cs   = Math.floor(ms / 10) % 100;
  const secs = Math.floor(ms / 1000) % 60;
  const mins = Math.floor(ms / 60000) % 60;
  const hrs  = Math.floor(ms / 3600000);
  return `${pad2(hrs)}:${pad2(mins)}:${pad2(secs)}.${pad2(cs)}`;
}

/**
 * Prepend a new lap <li> to the lap list.
 * @param {number} lapNumber — 1-based lap index
 * @param {number} ms        — total elapsed ms at this lap
 */
function renderLapItem(lapNumber, ms) {
  lapsEmpty.style.display = 'none';
  clearBtn.style.display  = '';

  const li = document.createElement('li');
  li.classList.add('lap-item');
  li.dataset.lapIndex = lapNumber - 1; // 0-based for array lookup

  li.innerHTML = `
    <span class="lap-num">LAP ${pad2(lapNumber)}</span>
    <span class="lap-badge-tag" id="lapTag-${lapNumber}"></span>
    <span class="lap-time">${formatTime(ms)}</span>
  `;

  // Insert at top (newest first)
  lapsList.prepend(li);
}

/**
 * Scan all recorded laps and mark the fastest / slowest item.
 * Lap *durations* (not cumulative times) are compared.
 */
function highlightFastestSlowest() {
  if (lapTimes.length < 2) {
    // Remove any existing tags when only 1 lap
    document.querySelectorAll('.lap-badge-tag').forEach(el => {
      el.textContent = '';
      el.className   = 'lap-badge-tag';
    });
    document.querySelectorAll('.lap-item').forEach(el => {
      el.classList.remove('is-fastest', 'is-slowest');
    });
    return;
  }

  // Build durations array from cumulative lap times
  const durations = lapTimes.map((t, i) => t - (i > 0 ? lapTimes[i - 1] : 0));

  const minDur    = Math.min(...durations);
  const maxDur    = Math.max(...durations);

  // Walk every rendered lap item and apply classes / tags
  document.querySelectorAll('.lap-item').forEach(li => {
    const idx      = parseInt(li.dataset.lapIndex, 10);
    const dur      = durations[idx];
    const tagEl    = li.querySelector('.lap-badge-tag');

    li.classList.remove('is-fastest', 'is-slowest');
    tagEl.textContent = '';
    tagEl.className   = 'lap-badge-tag';

    if (dur === minDur) {
      li.classList.add('is-fastest');
      tagEl.textContent = 'BEST';
      tagEl.classList.add('fastest');
    } else if (dur === maxDur) {
      li.classList.add('is-slowest');
      tagEl.textContent = 'SLOW';
      tagEl.classList.add('slowest');
    }
  });
}

/**
 * Update the lap count badge above the controls.
 */
function updateLapBadge() {
  const count = lapTimes.length;
  lapCountEl.textContent = count;
  if (count > 0) {
    lapBadge.classList.add('has-laps');
  } else {
    lapBadge.classList.remove('has-laps');
  }
}

/**
 * Set the running status indicator and label.
 * @param {'ready'|'running'|'paused'} state
 */
function setStatus(state) {
  statusDot.className   = 'status-indicator';
  statusLabel.className = 'status-label';

  const map = {
    ready:   { label: 'READY',   cls: '' },
    running: { label: 'RUNNING', cls: 'running' },
    paused:  { label: 'PAUSED',  cls: 'paused'  },
  };

  const cfg = map[state] || map.ready;
  statusLabel.textContent = cfg.label;
  if (cfg.cls) {
    statusDot.classList.add(cfg.cls);
    statusLabel.classList.add(cfg.cls);
  }
}

/* ── Utility ───────────────────────────────────────────────── */

/**
 * Zero-pad a number to at least 2 digits.
 * @param {number} n
 * @returns {string}
 */
function pad2(n) {
  return String(n).padStart(2, '0');
}

/* ── Keyboard shortcuts ────────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  // Ignore if user is typing in an input
  if (e.target.tagName === 'INPUT') return;

  switch (e.code) {
    case 'Space':
      e.preventDefault();
      isRunning ? pauseStopwatch() : startStopwatch();
      break;
    case 'KeyL':
      if (isRunning) recordLap();
      break;
    case 'KeyR':
      resetStopwatch();
      break;
  }
});

/* ── Init ──────────────────────────────────────────────────── */
// Ensure a clean initial state on page load
renderTime(0);
setStatus('ready');
pauseBtn.disabled = true;
lapBtn.disabled   = true;
