export async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export const getTimer = () => api("/api/timer");
export const startTimer = () => api("/api/timer/start", { method: "POST" });
export const pauseTimer = () => api("/api/timer/pause", { method: "POST" });
export const resetTimer = () => api("/api/timer/reset", { method: "POST" });
export const getSettings = () => api("/api/settings");
export const saveSettings = (settings) =>
  api("/api/settings", { method: "PUT", body: JSON.stringify(settings) });
export const sendTestSupport = (payload) =>
  api("/api/test/support", { method: "POST", body: JSON.stringify(payload) });
export const getAuthStatus = () => api("/auth/status");
export const getIntegrationStatus = () => api("/api/integration/status");
export const connectIntegration = () => api("/api/integration/connect", { method: "POST" });
export const disconnectIntegration = () => api("/api/integration/disconnect", { method: "POST" });
