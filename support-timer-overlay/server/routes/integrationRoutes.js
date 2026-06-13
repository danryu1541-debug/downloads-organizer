import express from "express";
import { refreshAccessToken } from "../integrations/officialPlatform/authClient.js";

export function createIntegrationRoutes({ sessionClient, tokenStore }) {
  const router = express.Router();

  router.get("/status", (request, response) => {
    response.json(sessionClient.getStatus());
  });

  router.post("/connect", async (request, response, next) => {
    try {
      const accessToken = await getValidAccessToken(tokenStore);
      const status = await sessionClient.connect(accessToken);
      response.json(status);
    } catch (error) {
      response.status(400).json({ message: error.message || "Integration connect failed." });
    }
  });

  router.post("/disconnect", (request, response) => {
    response.json(sessionClient.disconnect());
  });

  return router;
}

async function getValidAccessToken(tokenStore) {
  let tokens = await tokenStore.read();
  if (!tokens?.accessToken) {
    throw new Error("OAuth token is not connected.");
  }

  if (tokenStore.isExpired(tokens)) {
    if (!tokens.refreshToken) {
      throw new Error("Access token expired and refresh token is missing.");
    }
    const refreshed = await refreshAccessToken(tokens.refreshToken);
    await tokenStore.write(refreshed);
    tokens = await tokenStore.read();
  }

  return tokens.accessToken;
}
