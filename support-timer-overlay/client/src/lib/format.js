export function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export function formatAdded(seconds) {
  if (!seconds) return "+00:00";
  const sign = seconds < 0 ? "-" : "+";
  const absoluteSeconds = Math.abs(seconds);
  const minutes = Math.floor(absoluteSeconds / 60);
  const rest = absoluteSeconds % 60;
  return `${sign}${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}
