import express from "express";
import cors from "cors";
import fs from "node:fs";
import { env } from "./config/env.js";
import { distDir } from "./config/paths.js";
import { EventBus } from "./services/eventBus.js";
import { SettingsService } from "./services/settingsService.js";
import { TimerService } from "./services/timerService.js";
import { DonationQueue } from "./services/donationQueue.js";
import { TokenStore } from "./services/tokenStore.js";
import { createTimerRoutes } from "./routes/timerRoutes.js";
import { createSettingsRoutes } from "./routes/settingsRoutes.js";
import { createTestRoutes } from "./routes/testRoutes.js";
import { createAuthRoutes } from "./routes/authRoutes.js";
import { createIntegrationRoutes } from "./routes/integrationRoutes.js";
import { SessionClient } from "./integrations/officialPlatform/sessionClient.js";

const app = express();
const eventBus = new EventBus();
const settingsService = new SettingsService();
await settingsService.load();

const timerService = new TimerService({ eventBus, settingsService });
const donationQueue = new DonationQueue({ timerService, settingsService });
const tokenStore = new TokenStore();
const sessionClient = new SessionClient({ tokenStore, donationQueue, timerService });

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json());

app.get("/events", (request, response) => {
  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
  });
  response.write("\n");
  eventBus.addClient(response);
  eventBus.publish("timer", timerService.getState());
});

app.use("/api/timer", createTimerRoutes({ timerService }));
app.use("/api/settings", createSettingsRoutes({ settingsService, timerService }));
app.use("/api/test", createTestRoutes({ donationQueue }));
app.use("/auth", createAuthRoutes({ tokenStore }));
app.use("/api/integration", createIntegrationRoutes({ sessionClient, tokenStore }));

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((request, response) => {
    response.sendFile("index.html", { root: distDir });
  });
}

app.use((error, request, response, next) => {
  console.error(error);
  timerService.setError(error);
  response.status(500).json({ message: error.message || "Internal server error" });
});

app.listen(env.port, () => {
  console.log(`Server listening on http://127.0.0.1:${env.port}`);
});
