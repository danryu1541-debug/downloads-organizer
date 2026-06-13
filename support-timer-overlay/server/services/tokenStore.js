import fs from "node:fs/promises";
import { dataDir, tokensPath } from "../config/paths.js";

export class TokenStore {
  async read() {
    try {
      return JSON.parse(await fs.readFile(tokensPath, "utf8"));
    } catch {
      return null;
    }
  }

  async write(tokens) {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(tokensPath, JSON.stringify(this.normalize(tokens), null, 2));
  }

  async clear() {
    try {
      await fs.unlink(tokensPath);
    } catch {
      // Missing tokens are already cleared.
    }
  }

  normalize(tokens) {
    const expiresIn = Number(tokens.expiresIn || 86400);
    const savedAt = tokens.savedAt || new Date().toISOString();
    const expiresAt =
      tokens.expiresAt ||
      new Date(new Date(savedAt).getTime() + Math.max(0, expiresIn - 60) * 1000).toISOString();

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: tokens.tokenType || "Bearer",
      expiresIn,
      scope: tokens.scope || "",
      savedAt,
      expiresAt
    };
  }

  isExpired(tokens) {
    if (!tokens?.expiresAt) return true;
    return Date.now() >= new Date(tokens.expiresAt).getTime();
  }
}
