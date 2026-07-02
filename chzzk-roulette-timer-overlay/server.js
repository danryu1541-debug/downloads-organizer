require("dotenv").config();

const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { ChzzkDonationClient } = require("./src/chzzk");
const { findRule, normalizeAmount, rollRule } = require("./src/roulette");
const { readJson, writeJson } = require("./src/storage");
const { TimerManager, TIMER_KEYS } = require("./src/timers");

const rootDir = __dirname;
const configPath = path.join(rootDir, "config.json");
const statePath = path.join(rootDir, "state.json");

const defaultState = {
  timers: {
    boar: { remainingSeconds: 0, running: false, updatedAt: null },
    pig: { remainingSeconds: 0, running: false, updatedAt: null }
  },
  recentResults: [],
  processedEvents: []
};

let config = readJson(configPath, { donationRules: {}, maxRecentResults: 12 });
let savedState = { ...defaultState, ...readJson(statePath, defaultState) };

function persistState(timersSnapshot) {
  savedState.timers = timersSnapshot || timerManager.snapshot();
  writeJson(statePath, savedState);
}

const timerManager = new TimerManager(savedState.timers, persistState);

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const chzzkClient = new ChzzkDonationClient(process.env);

app.use(express.json());
app.use((req, res, next) => {
  if (req.path.endsWith(".html") || req.path === "/admin" || req.path === "/overlay") {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
  } else if (req.path.endsWith(".js")) {
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
  } else if (req.path.endsWith(".css")) {
    res.setHeader("Content-Type", "text/css; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
  } else if (req.path.startsWith("/api/")) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
  }
  next();
});
app.use(express.static(path.join(rootDir, "public")));

app.get("/", (req, res) => res.redirect("/admin"));
app.get("/overlay", (req, res) => res.sendFile(path.join(rootDir, "public", "overlay.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(rootDir, "public", "admin.html")));

app.get("/api/state", (req, res) => {
  res.json(getPublicState());
});

app.get("/api/config", (req, res) => {
  config = readJson(configPath, config);
  res.json(config);
});

app.put("/api/config", (req, res) => {
  try {
    const nextConfig = normalizeConfig(req.body);
    config = nextConfig;
    writeJson(configPath, config);
    broadcastState();
    res.json(config);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/timers/:target/:command", (req, res) => {
  try {
    const { target, command } = req.params;
    if (!TIMER_KEYS.includes(target)) return res.status(400).json({ error: "Invalid timer target." });

    if (command === "start") timerManager.start(target);
    else if (command === "stop") timerManager.stop(target);
    else if (command === "reset") timerManager.reset(target, Number(req.body?.seconds) || 0);
    else if (command === "adjust") timerManager.adjust(target, Number(req.body?.seconds) || 0);
    else return res.status(400).json({ error: "Invalid timer command." });

    broadcastState();
    res.json(getPublicState());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/test-donation", async (req, res) => {
  const amount = req.body?.amount ?? req.query?.amount;
  const eventId = req.body?.id || req.query?.id || `test-${normalizeAmount(amount)}-${Date.now()}`;
  const result = processDonationEvent({
    id: eventId,
    payAmount: Number(amount),
    timestamp: new Date().toISOString(),
    source: "test"
  });
  res.status(result.ok ? 200 : 400).json(result);
});

app.post("/api/results/clear", (req, res) => {
  savedState.recentResults = [];
  savedState.processedEvents = [];
  persistState();
  broadcastState();
  res.json(getPublicState());
});

app.post("/api/chzzk/donation", (req, res) => {
  chzzkClient.handleDonationPayload(req.body);
  res.json({ ok: true });
});

io.on("connection", (socket) => {
  socket.emit("state", getPublicState());
});

timerManager.on("tick", () => broadcastState(false));
timerManager.on("change", () => broadcastState());
chzzkClient.on("donation", (event) => processDonationEvent(event));

function processDonationEvent(event) {
  config = readJson(configPath, config);
  const eventId = String(event.id || event.timestamp || `${event.payAmount}-${Date.now()}`);

  if (savedState.processedEvents.includes(eventId)) {
    return { ok: false, duplicate: true, message: "Duplicate donation event ignored.", eventId };
  }

  const rule = findRule(config, event.payAmount);
  if (!rule) {
    rememberEvent(eventId);
    persistState();
    broadcastState();
    return {
      ok: false,
      eventId,
      message: `No roulette rule configured for amount ${event.payAmount}.`
    };
  }

  const results = rollRule(rule);
  for (const result of results) timerManager.applyResult(result);

  const logEntry = {
    id: eventId,
    source: event.source || "chzzk",
    amount: Number(event.payAmount),
    ruleName: rule.name || `${event.payAmount}`,
    timestamp: event.timestamp || new Date().toISOString(),
    results
  };
  savedState.recentResults.unshift(logEntry);
  savedState.recentResults = savedState.recentResults.slice(0, Number(config.maxRecentResults) || 12);
  rememberEvent(eventId);
  persistState();
  broadcastState();

  return { ok: true, eventId, amount: Number(event.payAmount), results };
}

function rememberEvent(eventId) {
  savedState.processedEvents.unshift(eventId);
  savedState.processedEvents = [...new Set(savedState.processedEvents)].slice(0, 300);
}

function getPublicState() {
  return {
    timers: timerManager.snapshot(),
    recentResults: savedState.recentResults || [],
    donationRules: Object.keys(config.donationRules || {}),
    overlayOptions: config.overlayOptions || defaultOverlayOptions()
  };
}

function broadcastState(includeConfig = true) {
  const state = getPublicState();
  if (!includeConfig) delete state.donationRules;
  io.emit("state", state);
}

function normalizeConfig(input) {
  const nextConfig = {
    currency: input?.currency || "KRW",
    maxRecentResults: Math.max(1, Math.min(50, Number(input?.maxRecentResults) || 12)),
    overlayOptions: normalizeOverlayOptions(input?.overlayOptions),
    donationRules: {}
  };

  const rules = input?.donationRules || {};
  for (const [amountKey, rule] of Object.entries(rules)) {
    const amount = normalizeAmount(amountKey);
    if (!amount) throw new Error(`Invalid donation amount: ${amountKey}`);
    const rolls = Math.max(1, Math.min(100, Number(rule?.rolls) || 1));
    const table = Array.isArray(rule?.table) ? rule.table : [];
    const normalizedTable = table.map((item, index) => normalizeRouletteItem(item, amount, index));
    if (normalizedTable.length === 0) {
      throw new Error(`${amount}원 룰렛에는 최소 1개 이상의 항목이 필요합니다.`);
    }

    nextConfig.donationRules[amount] = {
      name: String(rule?.name || `${amount}원 룰렛`),
      rolls,
      table: normalizedTable
    };
  }

  return nextConfig;
}

function defaultOverlayOptions() {
  return {
    width: 820,
    height: 80,
    opacity: 88,
    fontScale: 95,
    showRecentByDefault: false
  };
}

function normalizeOverlayOptions(input = {}) {
  const defaults = defaultOverlayOptions();
  return {
    width: Math.max(480, Math.min(1400, Number(input.width) || defaults.width)),
    height: Math.max(58, Math.min(180, Number(input.height) || defaults.height)),
    opacity: Math.max(35, Math.min(100, Number(input.opacity) || defaults.opacity)),
    fontScale: Math.max(70, Math.min(140, Number(input.fontScale) || defaults.fontScale)),
    showRecentByDefault: Boolean(input.showRecentByDefault)
  };
}

function normalizeRouletteItem(item, amount, index) {
  const target = item?.target;
  const action = item?.action;
  const weight = Number(item?.weight);
  const seconds = Number(item?.seconds);

  if (!["boar", "pig"].includes(target)) {
    throw new Error(`${amount}원 ${index + 1}번째 항목의 대상이 올바르지 않습니다.`);
  }
  if (!["add", "subtract"].includes(action)) {
    throw new Error(`${amount}원 ${index + 1}번째 항목의 동작이 올바르지 않습니다.`);
  }
  if (!Number.isFinite(weight) || weight <= 0) {
    throw new Error(`${amount}원 ${index + 1}번째 항목의 가중치는 0보다 커야 합니다.`);
  }
  if (!Number.isInteger(seconds) || seconds < 0) {
    throw new Error(`${amount}원 ${index + 1}번째 항목의 시간은 0 이상의 초 단위 정수여야 합니다.`);
  }

  return {
    label: String(item?.label || `${target} ${action} ${seconds}`),
    weight,
    target,
    action,
    seconds
  };
}

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "0.0.0.0";

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Change PORT in .env or close the other program.`);
  } else {
    console.error(error);
  }
  process.exit(1);
});

server.listen(port, host, async () => {
  timerManager.startTicker();
  await chzzkClient.start();
  console.log("Server is running. Keep this window open while using OBS overlay.");
  console.log(`Admin:   http://localhost:${port}/admin`);
  console.log(`Overlay: http://localhost:${port}/overlay`);
  console.log(`LAN:     http://YOUR-PC-IP:${port}/overlay`);
});
