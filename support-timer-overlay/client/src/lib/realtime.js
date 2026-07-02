export function subscribeTimer(onTimer) {
  const source = new EventSource("/events");
  source.addEventListener("timer", (event) => {
    onTimer(JSON.parse(event.data));
  });
  return () => source.close();
}
