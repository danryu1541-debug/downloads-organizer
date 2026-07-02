const EventEmitter = require("events");

class ChzzkDonationClient extends EventEmitter {
  constructor(env = process.env) {
    super();
    this.env = env;
    this.enabled = String(env.CHZZK_ENABLED || "false").toLowerCase() === "true";
  }

  async start() {
    if (!this.enabled) {
      console.log("CHZZK_ENABLED is false. Running in test mode only.");
      return;
    }

    const required = [
      "CHZZK_CLIENT_ID",
      "CHZZK_CLIENT_SECRET",
      "CHZZK_CHANNEL_ID",
      "CHZZK_ACCESS_TOKEN"
    ];
    const missing = required.filter((key) => !this.env[key]);
    if (missing.length > 0) {
      console.warn(`Chzzk integration disabled. Missing env values: ${missing.join(", ")}`);
      return;
    }

    console.log("Chzzk integration placeholder is ready.");
    console.log("Connect Session API here and emit donation events as { id, payAmount, timestamp }.");
  }

  handleDonationPayload(payload) {
    const payAmount = payload?.payAmount ?? payload?.amount;
    const id = payload?.id || payload?.eventId || payload?.timestamp || `${payAmount}-${Date.now()}`;
    this.emit("donation", {
      id: String(id),
      payAmount: Number(payAmount),
      timestamp: payload?.timestamp || new Date().toISOString(),
      raw: payload
    });
  }
}

module.exports = { ChzzkDonationClient };
