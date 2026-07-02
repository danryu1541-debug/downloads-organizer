import io from "socket.io-client";
import { requestOpenApi } from "./authClient.js";
import { mapDonationEvent } from "./eventMapper.js";

const socketOptions = {
  reconnection: false,
  "force new connection": true,
  "connect timeout": 3000,
  transports: ["websocket"]
};

export class SessionClient {
  constructor({ tokenStore, donationQueue, timerService }) {
    this.tokenStore = tokenStore;
    this.donationQueue = donationQueue;
    this.timerService = timerService;
    this.socket = null;
    this.status = "not_connected";
    this.sessionKey = null;
    this.lastMessage = null;
    this.eventLog = [];
    this.lastError = null;
    this.connectedAt = null;
  }

  getStatus() {
    return {
      status: this.status,
      sessionKey: this.sessionKey,
      connectedAt: this.connectedAt,
      lastMessage: this.lastMessage,
      eventLog: this.eventLog,
      lastError: this.lastError
    };
  }

  async connect(accessToken) {
    if (this.socket) this.disconnect();

    this.status = "creating_session";
    this.lastError = null;

    const session = await requestOpenApi("/open/v1/sessions/auth", { accessToken });
    const sessionUrl = session?.url;
    if (!sessionUrl) {
      throw new Error("Session URL was not returned.");
    }

    this.status = "connecting_socket";
    this.socket = io.connect(sessionUrl, socketOptions);
    this.captureAllSocketEvents(this.socket);
    this.bindSocket(accessToken);
    return this.getStatus();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.status = "not_connected";
    this.sessionKey = null;
    this.connectedAt = null;
    return this.getStatus();
  }

  bindSocket(accessToken) {
    this.socket.on("connect", () => {
      this.status = "socket_connected";
      this.connectedAt = new Date().toISOString();
    });

    this.socket.on("SYSTEM", async (rawMessage) => {
      const message = parseSocketMessage(rawMessage);
      this.lastMessage = { eventType: "SYSTEM", message, at: new Date().toISOString() };
      console.log("[official-event] SYSTEM", JSON.stringify(message));

      try {
        if (message?.type === "connected") {
          this.sessionKey = message.data?.sessionKey;
          await this.subscribeDonation(accessToken);
        }

        if (message?.type === "subscribed" && message.data?.eventType === "DONATION") {
          this.status = "subscribed_donation";
        }

        if (message?.type === "revoked") {
          this.status = "revoked";
          this.lastError = "Event permission was revoked.";
        }
      } catch (error) {
        this.setError(error);
      }
    });

    this.socket.on("DONATION", (rawMessage) => {
      const message = parseSocketMessage(rawMessage);
      this.lastMessage = { eventType: "DONATION", message, at: new Date().toISOString() };
      console.log("[official-event] DONATION", JSON.stringify(message));
      try {
        this.donationQueue.enqueue(mapDonationEvent(message));
      } catch (error) {
        this.setError(error);
      }
    });

    this.socket.on("disconnect", () => {
      this.status = "disconnected";
      console.log("[official-event] disconnected");
    });

    this.socket.on("connect_error", (error) => {
      this.setError(error);
      this.status = "connect_error";
      console.log("[official-event] connect_error", error?.message || String(error));
    });
  }

  captureAllSocketEvents(socket) {
    const originalOnevent = socket.onevent;
    socket.onevent = (packet) => {
      const args = packet?.data || [];
      const eventName = args[0];
      const payload = args[1];
      this.eventLog = [
        {
          eventName,
          payload: parseSocketMessage(payload),
          at: new Date().toISOString()
        },
        ...this.eventLog
      ].slice(0, 20);
      if (eventName !== "SYSTEM" && eventName !== "DONATION") {
        console.log("[official-event]", eventName, JSON.stringify(parseSocketMessage(payload)));
      }
      originalOnevent.call(socket, packet);
    };
  }

  async subscribeDonation(accessToken) {
    if (!this.sessionKey) {
      throw new Error("Missing session key.");
    }

    this.status = "subscribing_donation";
    await requestOpenApi("/open/v1/sessions/events/subscribe/donation", {
      accessToken,
      method: "POST",
      query: { sessionKey: this.sessionKey }
    });
  }

  setError(error) {
    this.lastError = error?.message || String(error);
    this.timerService?.setError(error);
  }
}

function parseSocketMessage(message) {
  if (typeof message !== "string") return message;
  try {
    return JSON.parse(message);
  } catch {
    return { raw: message };
  }
}
