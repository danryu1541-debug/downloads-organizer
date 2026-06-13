export class DonationQueue {
  constructor({ timerService, settingsService }) {
    this.timerService = timerService;
    this.settingsService = settingsService;
    this.queue = [];
    this.processing = false;
  }

  enqueue(event) {
    this.queue.push({
      id: crypto.randomUUID(),
      receivedAt: new Date().toISOString(),
      ...event
    });
    void this.process();
    return { queued: true, queueLength: this.queue.length };
  }

  async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const event = this.queue.shift();
      try {
        const result = this.roll(event);
        if (result) {
          this.timerService.applyRouletteResult({
            ...result,
            supporter: {
              name: event.supporterName || "익명",
              amount: event.amount || 0,
              message: event.message || "",
              eventId: event.id
            }
          });
        }
      } catch (error) {
        this.timerService.setError(error);
      }
      await new Promise((resolve) => setTimeout(resolve, 120));
    }

    this.processing = false;
  }

  roll(event) {
    const settings = this.settingsService.get();
    const amount = Math.max(0, Number(event.amount || 0));

    let action = null;
    if (amount === settings.roulette.addAmount) action = "add";
    if (amount === settings.roulette.subtractAmount) action = "subtract";
    if (!action) {
      console.log(`[roulette] ignored donation amount=${amount}`);
      return null;
    }

    const timerIds = Object.keys(settings.timers);
    const options = settings.roulette.optionsSeconds;

    const result = {
      action,
      timerId: this.pick(timerIds),
      seconds: this.pick(options),
      triggerAmount: amount
    };
    console.log(
      `[roulette] ${result.action} timer=${result.timerId} minutes=${Math.round(result.seconds / 60)} amount=${amount}`
    );
    return result;
  }

  pick(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Roulette option is empty");
    }
    return items[Math.floor(Math.random() * items.length)];
  }
}
