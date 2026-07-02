import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const rootDir = path.resolve(__dirname, "..", "..");
export const dataDir = path.join(rootDir, "server", "data");
export const settingsPath = path.join(dataDir, "settings.json");
export const tokensPath = path.join(dataDir, "tokens.json");
export const distDir = path.join(rootDir, "dist");
