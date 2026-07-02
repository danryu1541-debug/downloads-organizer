import express from "express";
import { buildAuthorizationUrl, exchangeCodeForToken, refreshAccessToken } from "../integrations/officialPlatform/authClient.js";
import { env } from "../config/env.js";

export function createAuthRoutes({ tokenStore }) {
  const router = express.Router();
  const pendingStates = new Set();

  router.get("/login", (request, response) => {
    const state = crypto.randomUUID();
    pendingStates.add(state);
    response.redirect(buildAuthorizationUrl(state));
  });

  router.get("/callback", async (request, response, next) => {
    try {
      const { code, state } = request.query;
      if (!code || !state) {
        response.status(400).send("Missing code or state");
        return;
      }
      if (!pendingStates.has(state)) {
        response.status(400).send("Invalid state");
        return;
      }
      pendingStates.delete(state);
      const tokens = await exchangeCodeForToken({ code, state });
      await tokenStore.write(tokens);
      response.redirect("/settings?auth=connected");
    } catch (error) {
      next(error);
    }
  });

  router.get("/status", async (request, response) => {
    const tokens = await tokenStore.read();
    response.json({
      configured: Boolean(env.platform.clientId && env.platform.clientSecret),
      connected: Boolean(tokens?.accessToken),
      savedAt: tokens?.savedAt || null,
      expiresAt: tokens?.expiresAt || null,
      scope: tokens?.scope || ""
    });
  });

  router.post("/refresh", async (request, response, next) => {
    try {
      const tokens = await tokenStore.read();
      if (!tokens?.refreshToken) {
        response.status(400).json({ message: "No refresh token saved." });
        return;
      }

      const refreshed = await refreshAccessToken(tokens.refreshToken);
      await tokenStore.write(refreshed);
      response.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  router.post("/logout", async (request, response) => {
    await tokenStore.clear();
    response.json({ ok: true });
  });

  return router;
}
