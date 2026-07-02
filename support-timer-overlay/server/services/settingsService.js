import fs from "node:fs/promises";
import { dataDir, settingsPath } from "../config/paths.js";

const defaults = {
  initialSeconds: 0,
  maxSeconds: 21600,
  overlayTitle: "Costume Timer",
  showMilliseconds: false,
  timers: {
    pig: { label: "돼지 의상" },
    boar: { label: "멧돼지 의상" }
  },
  roulette: {
    addAmount: 3900,
    subtractAmount: 4000,
    optionsSeconds: [1200, 1800]
  }
};

export class SettingsService {
  constructor() {
    this.settings = { ...defaults };
  }

  async load() {
    await fs.mkdir(dataDir, { recursive: true });
    try {
      const raw = await fs.readFile(settingsPath, "utf8");
      this.settings = this.normalize({ ...defaults, ...JSON.parse(raw) });
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.warn("[settings] failed to read settings, using defaults", error);
      }
      await this.save(this.settings);
    }
    return this.settings;
  }

  get() {
    return this.settings;
  }

  async save(nextSettings) {
    this.settings = this.normalize({ ...this.settings, ...nextSettings });
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(settingsPath, JSON.stringify(this.settings, null, 2));
    return this.settings;
  }

  normalize(value) {
    const optionsSeconds = Array.isArray(value.roulette?.optionsSeconds)
      ? value.roulette.optionsSeconds
      : defaults.roulette.optionsSeconds;

    return {
      initialSeconds: this.toNumber(value.initialSeconds, 0, 0, 86400),
      maxSeconds: this.toNumber(value.maxSeconds, 21600, 1, 604800),
      overlayTitle: String(value.overlayTitle || "Costume Timer").slice(0, 40),
      showMilliseconds: Boolean(value.showMilliseconds),
      timers: {
        pig: {
          label: String(value.timers?.pig?.label || defaults.timers.pig.label).slice(0, 30)
        },
        boar: {
          label: String(value.timers?.boar?.label || defaults.timers.boar.label).slice(0, 30)
        }
      },
      roulette: {
        addAmount: this.toNumber(value.roulette?.addAmount, 3900, 1, 100000000),
        subtractAmount: this.toNumber(value.roulette?.subtractAmount, 4000, 1, 100000000),
        optionsSeconds: optionsSeconds
          .map((seconds) => this.toNumber(seconds, 0, 1, 86400))
          .filter(Boolean)
          .slice(0, 8)
      }
    };
  }

  toNumber(value, fallback, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, Math.floor(number)));
  }
}
