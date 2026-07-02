export class TimerService {
  constructor({ eventBus, settingsService }) {
    this.eventBus = eventBus;
    this.settingsService = settingsService;
    this.timers = {
      pig: this.createTimer("pig"),
      boar: this.createTimer("boar")
    };
    this.lastTick = Date.now();
    this.recentEvent = null;
    this.eventHistory = [];
    this.lastError = null;
    this.interval = setInterval(() => this.tick(), 250);
  }

  createTimer(id) {
    return {
      id,
      remainingMs: 0,
      running: false
    };
  }

  getState() {
    return {
      timers: Object.fromEntries(
        Object.entries(this.timers).map(([id, timer]) => [
          id,
          {
            ...timer,
            remainingMs: Math.max(0, Math.round(timer.remainingMs))
          }
        ])
      ),
      recentEvent: this.recentEvent,
      eventHistory: this.eventHistory,
      lastError: this.lastError,
      settings: this.settingsService.get()
    };
  }

  start() {
    for (const timer of Object.values(this.timers)) {
      timer.running = true;
    }
    this.lastTick = Date.now();
    this.publish();
  }

  pause() {
    this.tick();
    for (const timer of Object.values(this.timers)) {
      timer.running = false;
    }
    this.publish();
  }

  reset() {
    const settings = this.settingsService.get();
    for (const timer of Object.values(this.timers)) {
      timer.remainingMs = settings.initialSeconds * 1000;
      timer.running = false;
    }
    this.recentEvent = null;
    this.eventHistory = [];
    this.lastError = null;
    this.publish();
  }

  applyRouletteResult(result) {
    const settings = this.settingsService.get();
    const timer = this.timers[result.timerId];
    if (!timer) {
      throw new Error(`Unknown timer: ${result.timerId}`);
    }

    const deltaMs = Math.max(0, Number(result.seconds) || 0) * 1000;
    if (result.action === "subtract") {
      timer.remainingMs = Math.max(0, timer.remainingMs - deltaMs);
    } else {
      timer.remainingMs = Math.min(settings.maxSeconds * 1000, timer.remainingMs + deltaMs);
    }

    this.recentEvent = {
      ...result,
      at: new Date().toISOString()
    };
    this.eventHistory = [this.recentEvent, ...this.eventHistory].slice(0, 10);
    this.publish();
  }

  setError(error) {
    this.lastError = {
      message: error?.message || String(error),
      at: new Date().toISOString()
    };
    this.publish();
  }

  tick() {
    const now = Date.now();
    const elapsed = now - this.lastTick;
    this.lastTick = now;

    let changed = false;
    for (const timer of Object.values(this.timers)) {
      if (!timer.running || timer.remainingMs <= 0) continue;
      timer.remainingMs = Math.max(0, timer.remainingMs - elapsed);
      if (timer.remainingMs === 0) {
        timer.running = false;
      }
      changed = true;
    }

    if (changed) this.publish();
  }

  publish() {
    this.eventBus.publish("timer", this.getState());
  }
}
