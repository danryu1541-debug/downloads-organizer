const EventEmitter = require("events");

const TIMER_KEYS = ["boar", "pig"];

function nowMs() {
  return Date.now();
}

function clampSeconds(seconds) {
  return Math.max(0, Math.floor(Number(seconds) || 0));
}

function emptyTimer() {
  return { remainingSeconds: 0, running: false, updatedAt: null };
}

class TimerManager extends EventEmitter {
  constructor(initialState, saveState) {
    super();
    this.saveState = saveState;
    this.state = {
      boar: { ...emptyTimer(), ...(initialState?.boar || {}) },
      pig: { ...emptyTimer(), ...(initialState?.pig || {}) }
    };
    this.interval = null;
  }

  startTicker() {
    if (this.interval) return;
    this.interval = setInterval(() => {
      let changed = false;
      for (const key of TIMER_KEYS) {
        const timer = this.state[key];
        const remaining = this.getRemainingSeconds(key);
        if (timer.running && remaining <= 0) {
          timer.remainingSeconds = 0;
          timer.running = false;
          timer.updatedAt = new Date().toISOString();
          changed = true;
        }
      }
      if (changed) this.persist();
      this.emit("tick", this.snapshot());
    }, 1000);
  }

  getRemainingSeconds(key) {
    this.assertKey(key);
    const timer = this.state[key];
    if (!timer.running || !timer.updatedAt) return clampSeconds(timer.remainingSeconds);
    const elapsed = Math.floor((nowMs() - new Date(timer.updatedAt).getTime()) / 1000);
    return clampSeconds(timer.remainingSeconds - elapsed);
  }

  snapshot() {
    const timers = {};
    for (const key of TIMER_KEYS) {
      timers[key] = {
        remainingSeconds: this.getRemainingSeconds(key),
        running: this.state[key].running,
        updatedAt: this.state[key].updatedAt
      };
    }
    return timers;
  }

  start(key) {
    this.assertKey(key);
    const timer = this.state[key];
    timer.remainingSeconds = this.getRemainingSeconds(key);
    if (timer.remainingSeconds > 0) {
      timer.running = true;
      timer.updatedAt = new Date().toISOString();
    }
    this.persist();
    return this.snapshot();
  }

  stop(key) {
    this.assertKey(key);
    const timer = this.state[key];
    timer.remainingSeconds = this.getRemainingSeconds(key);
    timer.running = false;
    timer.updatedAt = new Date().toISOString();
    this.persist();
    return this.snapshot();
  }

  reset(key, seconds = 0) {
    this.assertKey(key);
    this.state[key] = {
      remainingSeconds: clampSeconds(seconds),
      running: false,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.snapshot();
  }

  adjust(key, deltaSeconds) {
    this.assertKey(key);
    const timer = this.state[key];
    const nextRemaining = clampSeconds(this.getRemainingSeconds(key) + Number(deltaSeconds));
    timer.remainingSeconds = nextRemaining;
    timer.updatedAt = new Date().toISOString();
    if (nextRemaining <= 0) timer.running = false;
    this.persist();
    return this.snapshot();
  }

  applyResult(result) {
    const delta = result.action === "subtract" ? -result.seconds : result.seconds;
    return this.adjust(result.target, delta);
  }

  persist() {
    if (typeof this.saveState === "function") this.saveState(this.snapshot());
    this.emit("change", this.snapshot());
  }

  assertKey(key) {
    if (!TIMER_KEYS.includes(key)) {
      throw new Error(`Unknown timer key: ${key}`);
    }
  }
}

module.exports = { TimerManager, TIMER_KEYS };
