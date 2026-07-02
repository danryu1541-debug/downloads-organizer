export class EventBus {
  constructor() {
    this.clients = new Set();
  }

  addClient(response) {
    this.clients.add(response);
    response.on("close", () => this.clients.delete(response));
  }

  publish(event, payload) {
    const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(data);
      } catch (error) {
        this.clients.delete(client);
      }
    }
  }
}
