import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 3000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://127.0.0.1:5173",
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://localhost:3000",
  platform: {
    clientId: process.env.PLATFORM_CLIENT_ID || "",
    clientSecret: process.env.PLATFORM_CLIENT_SECRET || "",
    redirectUri:
      process.env.PLATFORM_REDIRECT_URI || "http://localhost:3000/auth/callback"
  }
};
