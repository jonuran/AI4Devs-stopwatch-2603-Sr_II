(() => {
  const $ = (selector) => document.querySelector(selector);

  const ui = {
    tabs: {
      stopwatch: $("#stopwatchTab"),
      countdown: $("#countdownTab"),
    },
    panels: {
      stopwatch: $("#stopwatchPanel"),
      countdown: $("#countdownPanel"),
    },
    fullscreenToggle: $("#fullscreenToggle"),

    stopwatch: {
      display: $("#stopwatchDisplay"),
      status: $("#stopwatchStatus"),
      start: $("#stopwatchStart"),
      pause: $("#stopwatchPause"),
      resume: $("#stopwatchResume"),
      reset: $("#stopwatchReset"),
    },

    countdown: {
      display: $("#countdownDisplay"),
      status: $("#countdownStatus"),
      hint: $("#countdownHint"),
      hours: $("#hoursInput"),
      minutes: $("#minutesInput"),
      seconds: $("#secondsInput"),
      start: $("#countdownStart"),
      pause: $("#countdownPause"),
      resume: $("#countdownResume"),
      reset: $("#countdownReset"),
    },
  };

  const stopwatch = {
    startTime: 0,
    elapsedBeforePause: 0,
    isRunning: false,
    rafId: null,
  };

  const countdown = {
    durationMs: 0,
    endTime: 0,
    remainingBeforePause: 0,
    isRunning: false,
    rafId: null,
    audioCtx: null,
  };

  function pad(value, size = 2) {
    return String(value).padStart(size, "0");
  }

  function formatTime(ms) {
    const safeMs = Math.max(0, ms);
    const totalCentiseconds = Math.floor(safeMs / 10);
    const centiseconds = totalCentiseconds % 100;
    const totalSeconds = Math.floor(safeMs / 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
  }

  function setMode(mode) {
    const isStopwatch = mode === "stopwatch";

    ui.tabs.stopwatch.classList.toggle("is-active", isStopwatch);
    ui.tabs.countdown.classList.toggle("is-active", !isStopwatch);
    ui.tabs.stopwatch.setAttribute("aria-pressed", String(isStopwatch));
    ui.tabs.countdown.setAttribute("aria-pressed", String(!isStopwatch));

    ui.panels.stopwatch.classList.toggle("is-active", isStopwatch);
    ui.panels.countdown.classList.toggle("is-active", !isStopwatch);

    ui.panels.stopwatch.hidden = !isStopwatch;
    ui.panels.countdown.hidden = isStopwatch;
  }

  function updateStopwatchButtons() {
    ui.stopwatch.start.disabled = stopwatch.isRunning || stopwatch.elapsedBeforePause > 0;
    ui.stopwatch.pause.disabled = !stopwatch.isRunning;
    ui.stopwatch.resume.disabled = stopwatch.isRunning || stopwatch.elapsedBeforePause === 0;
  }

  function renderStopwatch() {
    const elapsed = stopwatch.isRunning
      ? stopwatch.elapsedBeforePause + (performance.now() - stopwatch.startTime)
      : stopwatch.elapsedBeforePause;

    ui.stopwatch.display.textContent = formatTime(elapsed);
  }

  function stopwatchLoop() {
    renderStopwatch();
    if (stopwatch.isRunning) {
      stopwatch.rafId = requestAnimationFrame(stopwatchLoop);
    }
  }

  function startStopwatch() {
    if (stopwatch.isRunning) return;

    stopwatch.startTime = performance.now();
    stopwatch.isRunning = true;
    ui.stopwatch.status.textContent = "Running";
    updateStopwatchButtons();
    stopwatchLoop();
  }

  function pauseStopwatch() {
    if (!stopwatch.isRunning) return;

    stopwatch.elapsedBeforePause += performance.now() - stopwatch.startTime;
    stopwatch.isRunning = false;
    cancelAnimationFrame(stopwatch.rafId);
    ui.stopwatch.status.textContent = "Paused";
    renderStopwatch();
    updateStopwatchButtons();
  }

  function resumeStopwatch() {
    if (stopwatch.isRunning || stopwatch.elapsedBeforePause === 0) return;

    stopwatch.startTime = performance.now();
    stopwatch.isRunning = true;
    ui.stopwatch.status.textContent = "Running";
    updateStopwatchButtons();
    stopwatchLoop();
  }

  function resetStopwatch() {
    stopwatch.isRunning = false;
    stopwatch.startTime = 0;
    stopwatch.elapsedBeforePause = 0;
    cancelAnimationFrame(stopwatch.rafId);
    ui.stopwatch.status.textContent = "Ready";
    ui.stopwatch.display.textContent = "00:00:00.00";
    updateStopwatchButtons();
  }

  function sanitizeIntegerInput(input, max) {
    const raw = input.value.trim();

    if (raw === "") {
      input.value = "";
      return 0;
    }

    const numeric = Number(raw);

    if (!Number.isFinite(numeric) || numeric < 0) {
      input.value = "0";
      return 0;
    }

    const safeValue = Math.min(Math.floor(numeric), max);
    input.value = String(safeValue);
    return safeValue;
  }

  function getCountdownDurationMs() {
    const hours = sanitizeIntegerInput(ui.countdown.hours, 99);
    const minutes = sanitizeIntegerInput(ui.countdown.minutes, 59);
    const seconds = sanitizeIntegerInput(ui.countdown.seconds, 59);

    return ((hours * 3600) + (minutes * 60) + seconds) * 1000;
  }

  function updateCountdownButtons() {
    const hasConfiguredTime = countdown.durationMs > 0 || getCountdownPreviewDuration() > 0;

    ui.countdown.start.disabled = countdown.isRunning;
    ui.countdown.pause.disabled = !countdown.isRunning;
    ui.countdown.resume.disabled = countdown.isRunning || countdown.remainingBeforePause <= 0 || countdown.remainingBeforePause === countdown.durationMs;
    ui.countdown.reset.disabled = !hasConfiguredTime && !countdown.isRunning && countdown.remainingBeforePause === 0;
  }

  function getCountdownPreviewDuration() {
    const hours = Number(ui.countdown.hours.value || 0);
    const minutes = Number(ui.countdown.minutes.value || 0);
    const seconds = Number(ui.countdown.seconds.value || 0);

    return ((hours * 3600) + (minutes * 60) + seconds) * 1000;
  }

  function renderCountdown(remainingMs) {
    ui.countdown.display.textContent = formatTime(remainingMs);
  }

  function countdownLoop() {
    const remaining = Math.max(0, countdown.endTime - performance.now());
    renderCountdown(remaining);

    if (remaining <= 0) {
      finishCountdown();
      return;
    }

    if (countdown.isRunning) {
      countdown.rafId = requestAnimationFrame(countdownLoop);
    }
  }

  function setCountdownStatus(text, finished = false) {
    ui.countdown.status.textContent = text;
    ui.countdown.status.classList.toggle("is-finished", finished);
  }

  function startCountdown() {
    const durationMs = getCountdownDurationMs();

    if (durationMs <= 0) {
      countdown.durationMs = 0;
      countdown.remainingBeforePause = 0;
      renderCountdown(0);
      setCountdownStatus("Enter a valid time");
      ui.countdown.hint.textContent = "The countdown cannot start from zero.";
      updateCountdownButtons();
      return;
    }

    countdown.durationMs = durationMs;
    countdown.remainingBeforePause = durationMs;
    countdown.endTime = performance.now() + durationMs;
    countdown.isRunning = true;

    setCountdownStatus("Running");
    ui.countdown.hint.textContent = "Counting down...";
    updateCountdownButtons();
    countdownLoop();
  }

  function pauseCountdown() {
    if (!countdown.isRunning) return;

    countdown.remainingBeforePause = Math.max(0, countdown.endTime - performance.now());
    countdown.isRunning = false;
    cancelAnimationFrame(countdown.rafId);
    renderCountdown(countdown.remainingBeforePause);
    setCountdownStatus("Paused");
    ui.countdown.hint.textContent = "Press Resume to continue.";
    updateCountdownButtons();
  }

  function resumeCountdown() {
    if (countdown.isRunning || countdown.remainingBeforePause <= 0) return;

    countdown.endTime = performance.now() + countdown.remainingBeforePause;
    countdown.isRunning = true;
    setCountdownStatus("Running");
    ui.countdown.hint.textContent = "Counting down...";
    updateCountdownButtons();
    countdownLoop();
  }

  function resetCountdown() {
    countdown.isRunning = false;
    countdown.durationMs = 0;
    countdown.endTime = 0;
    countdown.remainingBeforePause = 0;
    cancelAnimationFrame(countdown.rafId);

    ui.countdown.hours.value = "";
    ui.countdown.minutes.value = "";
    ui.countdown.seconds.value = "";

    renderCountdown(0);
    setCountdownStatus("Set a time");
    ui.countdown.hint.textContent = "Enter a duration and press Start.";
    updateCountdownButtons();
  }

  function beep() {
    try {
      const AudioContextRef = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextRef) return;

      if (!countdown.audioCtx) {
        countdown.audioCtx = new AudioContextRef();
      }

      const ctx = countdown.audioCtx;
      const now = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(now);
      oscillator.stop(now + 0.26);
    } catch (error) {
      // Ignore audio failures silently.
    }
  }

  function finishCountdown() {
    countdown.isRunning = false;
    countdown.remainingBeforePause = 0;
    cancelAnimationFrame(countdown.rafId);
    renderCountdown(0);
    setCountdownStatus("Finished", true);
    ui.countdown.hint.textContent = "Time is up.";
    updateCountdownButtons();
    beep();
  }

  function handleFullscreenToggle() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      return;
    }

    document.exitFullscreen?.();
  }

  function bindEvents() {
    ui.tabs.stopwatch.addEventListener("click", () => setMode("stopwatch"));
    ui.tabs.countdown.addEventListener("click", () => setMode("countdown"));

    ui.fullscreenToggle.addEventListener("click", handleFullscreenToggle);

    ui.stopwatch.start.addEventListener("click", startStopwatch);
    ui.stopwatch.pause.addEventListener("click", pauseStopwatch);
    ui.stopwatch.resume.addEventListener("click", resumeStopwatch);
    ui.stopwatch.reset.addEventListener("click", resetStopwatch);

    ui.countdown.start.addEventListener("click", startCountdown);
    ui.countdown.pause.addEventListener("click", pauseCountdown);
    ui.countdown.resume.addEventListener("click", resumeCountdown);
    ui.countdown.reset.addEventListener("click", resetCountdown);

    [ui.countdown.hours, ui.countdown.minutes, ui.countdown.seconds].forEach((input, index) => {
      const max = index === 0 ? 99 : 59;

      input.addEventListener("input", () => {
        const value = input.value.replace(/[^\d]/g, "");
        input.value = value;
        if (!countdown.isRunning) {
          sanitizeIntegerInput(input, max);
          const previewMs = getCountdownPreviewDuration();
          renderCountdown(previewMs);
          setCountdownStatus(previewMs > 0 ? "Ready" : "Set a time");
          ui.countdown.hint.textContent = previewMs > 0
            ? "Press Start to begin the countdown."
            : "Enter a duration and press Start.";
          updateCountdownButtons();
        }
      });

      input.addEventListener("blur", () => {
        sanitizeIntegerInput(input, max);
        if (!countdown.isRunning) {
          const previewMs = getCountdownPreviewDuration();
          renderCountdown(previewMs);
          updateCountdownButtons();
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      const activeElement = document.activeElement;
      const typingInField = activeElement instanceof HTMLInputElement;

      if (event.code === "Space" && !typingInField) {
        event.preventDefault();

        if (ui.panels.stopwatch.classList.contains("is-active")) {
          if (!stopwatch.isRunning && stopwatch.elapsedBeforePause === 0) {
            startStopwatch();
          } else if (stopwatch.isRunning) {
            pauseStopwatch();
          } else {
            resumeStopwatch();
          }
        } else {
          if (!countdown.isRunning && countdown.remainingBeforePause === 0) {
            startCountdown();
          } else if (countdown.isRunning) {
            pauseCountdown();
          } else {
            resumeCountdown();
          }
        }
      }

      if (event.key.toLowerCase() === "r" && !typingInField) {
        if (ui.panels.stopwatch.classList.contains("is-active")) {
          resetStopwatch();
        } else {
          resetCountdown();
        }
      }
    });
  }

  function init() {
    setMode("stopwatch");
    resetStopwatch();
    resetCountdown();
    bindEvents();
  }

  init();
})();