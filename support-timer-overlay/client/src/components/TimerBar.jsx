import { useEffect, useState } from "react";
import { formatAdded, formatTime } from "../lib/format.js";

const fallbackTimers = {
  pig: { label: "돼지 의상" },
  boar: { label: "멧돼지 의상" }
};

export function TimerBar({ state }) {
  const settings = state?.settings || {};
  const timerSettings = settings.timers || fallbackTimers;
  const timers = state?.timers || {};
  const recent = state?.recentEvent;
  const [rollingEventId, setRollingEventId] = useState(null);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    const eventId = recent?.supporter?.eventId;
    if (!eventId || eventId === rollingEventId) return;

    setRollingEventId(eventId);
    setRolling(true);
    const timeout = setTimeout(() => setRolling(false), 2200);
    return () => clearTimeout(timeout);
  }, [recent, rollingEventId]);

  return (
    <section className="timer-shell">
      <div className="timer-meta">
        <span>{settings.overlayTitle || "Costume Timer"}</span>
        <span className={rolling ? "status rolling" : "status"}>
          {rolling ? "룰렛 도는 중" : recent ? "룰렛 결과" : "READY"}
        </span>
      </div>

      <div className="costume-grid">
        {Object.entries(timerSettings).map(([id, config]) => (
          <CostumeTimer
            key={id}
            id={id}
            label={config.label}
            timer={timers[id]}
            maxSeconds={settings.maxSeconds || 1}
            recent={recent}
          />
        ))}
      </div>

      <div className={rolling ? "roulette-banner rolling" : "roulette-banner"}>
        {recent ? describeRecent(recent, timerSettings, rolling) : "테스트 후원을 넣으면 룰렛 결과가 표시됩니다."}
      </div>
    </section>
  );
}

function CostumeTimer({ id, label, timer, maxSeconds, recent }) {
  const remainingMs = timer?.remainingMs || 0;
  const maxMs = Math.max(1, maxSeconds * 1000);
  const percent = Math.min(100, Math.max(0, (remainingMs / maxMs) * 100));
  const isRecent = recent?.timerId === id;
  const delta = isRecent ? (recent.action === "subtract" ? -recent.seconds : recent.seconds) : 0;

  return (
    <div className={getTimerClassName(isRecent, recent)}>
      <div className="costume-head">
        <span>{label}</span>
        <span className={timer?.running ? "status live" : "status"}>{timer?.running ? "RUNNING" : "PAUSED"}</span>
      </div>
      <div className="timer-row">
        <strong className="time">{formatTime(remainingMs)}</strong>
        <span className={delta < 0 ? "delta minus" : "delta"}>{formatAdded(delta)}</span>
      </div>
      <div className="track">
        <div className="fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function getTimerClassName(isRecent, recent) {
  const classes = ["costume-timer"];
  if (isRecent) classes.push("active", recent.action === "subtract" ? "subtract" : "add");
  return classes.join(" ");
}

function describeRecent(recent, timerSettings, rolling = false) {
  if (rolling) {
    return "의상과 시간이 선택되는 중...";
  }
  const label = timerSettings[recent.timerId]?.label || recent.timerId;
  const verb = recent.action === "subtract" ? "감소" : "추가";
  const minutes = Math.round(recent.seconds / 60);
  const name = recent.supporter?.name || "익명";
  const amount = Number(recent.supporter?.amount || recent.triggerAmount || 0).toLocaleString();
  return `${name} · ${amount}원 · ${label} ${minutes}분 ${verb}`;
}
