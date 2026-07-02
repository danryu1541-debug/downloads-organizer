import { useEffect, useState } from "react";
import { ExternalLink, Save, Send } from "lucide-react";
import { ControlPanel } from "../components/ControlPanel.jsx";
import { RecentDonation } from "../components/RecentDonation.jsx";
import {
  getAuthStatus,
  getIntegrationStatus,
  getSettings,
  getTimer,
  connectIntegration,
  disconnectIntegration,
  saveSettings,
  sendTestSupport
} from "../lib/api.js";
import { subscribeTimer } from "../lib/realtime.js";
import { TimerBar } from "../components/TimerBar.jsx";
import "../styles/settings.css";

const defaultTestEvent = {
  supporterName: "테스트 후원자",
  amount: 3900,
  message: "룰렛 테스트"
};

export function SettingsPage() {
  const [timer, setTimer] = useState(null);
  const [settings, setSettings] = useState(null);
  const [testEvent, setTestEvent] = useState(defaultTestEvent);
  const [auth, setAuth] = useState(null);
  const [integration, setIntegration] = useState(null);
  const [notice, setNotice] = useState("");

  const handleTimerUpdate = (nextTimer) => {
    setTimer((current) => {
      const currentHistory = current?.eventHistory || [];
      const incomingHistory = nextTimer?.eventHistory?.length
        ? nextTimer.eventHistory
        : nextTimer?.recentEvent
          ? [nextTimer.recentEvent, ...currentHistory]
          : currentHistory;

      return {
        ...nextTimer,
        eventHistory: uniqueEvents(incomingHistory).slice(0, 10)
      };
    });
  };

  useEffect(() => {
    getTimer().then(handleTimerUpdate).catch(console.error);
    getSettings().then(setSettings).catch(console.error);
    getAuthStatus().then(setAuth).catch(console.error);
    getIntegrationStatus().then(setIntegration).catch(console.error);
    return subscribeTimer(handleTimerUpdate);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      getIntegrationStatus().then(setIntegration).catch(console.error);
      getAuthStatus().then(setAuth).catch(console.error);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const updateTimerLabel = (timerId, label) => {
    setSettings((current) => ({
      ...current,
      timers: {
        ...current.timers,
        [timerId]: { ...current.timers[timerId], label }
      }
    }));
  };

  const updateRoulette = (key, value) => {
    setSettings((current) => ({
      ...current,
      roulette: { ...current.roulette, [key]: value }
    }));
  };

  const submitSettings = async (event) => {
    event.preventDefault();
    const saved = await saveSettings(settings);
    setSettings(saved);
    setNotice("설정을 저장했습니다.");
  };

  const submitTest = async (event) => {
    event.preventDefault();
    await sendTestSupport(testEvent);
    setNotice("테스트 후원을 룰렛 큐에 추가했습니다.");
  };

  const quickTest = async (amount) => {
    await sendTestSupport({ ...testEvent, amount });
    setNotice(`${amount.toLocaleString()}원 테스트 후원을 추가했습니다.`);
  };

  const burstTest = async () => {
    const addAmount = settings?.roulette?.addAmount || 3900;
    const subtractAmount = settings?.roulette?.subtractAmount || 4000;
    const amounts = [addAmount, addAmount, subtractAmount, addAmount, subtractAmount];

    for (const amount of amounts) {
      await sendTestSupport({ ...testEvent, amount });
    }
    setNotice("연속 후원 테스트 5건을 큐에 추가했습니다.");
  };

  const connectSession = async () => {
    const status = await connectIntegration();
    setIntegration(status);
    setNotice("공식 후원 세션 연결을 시작했습니다.");
  };

  const disconnectSession = async () => {
    const status = await disconnectIntegration();
    setIntegration(status);
    setNotice("공식 후원 세션 연결을 해제했습니다.");
  };

  return (
    <main className="settings-page">
      <header className="topbar">
        <div>
          <h1>Costume Timer Overlay</h1>
          <p>OBS용 의상별 룰렛 타이머 MVP</p>
        </div>
        <div className="topbar-actions">
          <a href="/overlay" target="_blank" rel="noreferrer">
            <ExternalLink size={18} />
            브라우저 미리보기
          </a>
          <a href="/overlay?transparent=1" target="_blank" rel="noreferrer">
            <ExternalLink size={18} />
            OBS 투명 URL
          </a>
        </div>
      </header>

      <section className="preview-band">
        <TimerBar state={timer} />
      </section>

      <section className="grid">
        <div className="panel">
          <h2>타이머</h2>
          <ControlPanel onChange={handleTimerUpdate} />
          <RecentDonation state={timer} />
          {timer?.lastError && <p className="error">최근 오류: {timer.lastError.message}</p>}
        </div>

        <form className="panel form" onSubmit={submitTest}>
          <h2>테스트 후원</h2>
          <div className="quick-actions">
            <button type="button" onClick={() => quickTest(settings?.roulette?.addAmount || 3900)}>
              + 룰렛
            </button>
            <button type="button" className="danger" onClick={() => quickTest(settings?.roulette?.subtractAmount || 4000)}>
              - 룰렛
            </button>
            <button type="button" className="secondary" onClick={burstTest}>
              연속 테스트
            </button>
          </div>
          <label>
            후원자
            <input
              value={testEvent.supporterName}
              onChange={(event) => setTestEvent({ ...testEvent, supporterName: event.target.value })}
            />
          </label>
          <label>
            금액
            <input
              type="number"
              min="0"
              value={testEvent.amount}
              onChange={(event) => setTestEvent({ ...testEvent, amount: Number(event.target.value) })}
            />
          </label>
          <label>
            메시지
            <input
              value={testEvent.message}
              onChange={(event) => setTestEvent({ ...testEvent, message: event.target.value })}
            />
          </label>
          <button type="submit">
            <Send size={18} />
            큐에 추가
          </button>
        </form>

        <form className="panel form" onSubmit={submitSettings}>
          <h2>룰렛 설정</h2>
          <label>
            오버레이 제목
            <input value={settings?.overlayTitle || ""} onChange={(event) => updateSetting("overlayTitle", event.target.value)} />
          </label>
          <label>
            돼지 타이머 이름
            <input
              value={settings?.timers?.pig?.label || ""}
              onChange={(event) => updateTimerLabel("pig", event.target.value)}
            />
          </label>
          <label>
            멧돼지 타이머 이름
            <input
              value={settings?.timers?.boar?.label || ""}
              onChange={(event) => updateTimerLabel("boar", event.target.value)}
            />
          </label>
          <label>
            추가 룰렛 금액
            <input
              type="number"
              min="1"
              value={settings?.roulette?.addAmount || 3900}
              onChange={(event) => updateRoulette("addAmount", Number(event.target.value))}
            />
          </label>
          <label>
            감소 룰렛 금액
            <input
              type="number"
              min="1"
              value={settings?.roulette?.subtractAmount || 4000}
              onChange={(event) => updateRoulette("subtractAmount", Number(event.target.value))}
            />
          </label>
          <label>
            룰렛 후보 시간
            <input
              value={toMinutesText(settings?.roulette?.optionsSeconds)}
              onChange={(event) => updateRoulette("optionsSeconds", fromMinutesText(event.target.value))}
            />
          </label>
          <label>
            최대 시간 초
            <input
              type="number"
              min="1"
              value={settings?.maxSeconds || 21600}
              onChange={(event) => updateSetting("maxSeconds", Number(event.target.value))}
            />
          </label>
          <button type="submit">
            <Save size={18} />
            저장
          </button>
        </form>

        <div className="panel">
          <h2>공식 연동</h2>
          <dl className="status-list">
            <div>
              <dt>앱 설정</dt>
              <dd>{auth?.configured ? "완료" : ".env 필요"}</dd>
            </div>
            <div>
              <dt>OAuth</dt>
              <dd>{auth?.connected ? `연결됨 ${auth.savedAt || ""}` : "미연결"}</dd>
            </div>
            <div>
              <dt>Scope</dt>
              <dd>{auth?.scope || "후원 조회 필요"}</dd>
            </div>
            <div>
              <dt>세션</dt>
              <dd>{integration?.status || "확인 중"}</dd>
            </div>
          </dl>
          <div className="integration-actions">
            <a className="button-link" href="/auth/login">
              <ExternalLink size={18} />
              OAuth 연결
            </a>
            <button type="button" onClick={connectSession}>
              세션 연결
            </button>
            <button type="button" className="secondary" onClick={disconnectSession}>
              세션 해제
            </button>
          </div>
          {integration?.lastError && <p className="error">연동 오류: {integration.lastError}</p>}
        </div>

        <div className="panel log-panel">
          <h2>최근 룰렛 로그 <small>최대 10개</small></h2>
          <RouletteLog state={timer} />
        </div>
      </section>

      {notice && <div className="toast">{notice}</div>}
    </main>
  );
}

function uniqueEvents(events) {
  const seen = new Set();
  const result = [];

  for (const event of events) {
    const key = event.supporter?.eventId || `${event.at}-${event.timerId}-${event.action}-${event.seconds}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(event);
  }

  return result;
}

function RouletteLog({ state }) {
  const history = (state?.eventHistory?.length
    ? state.eventHistory
    : state?.recentEvent
      ? [state.recentEvent]
      : []
  ).slice(0, 10);
  const labels = state?.settings?.timers || {};

  if (history.length === 0) {
    return <p className="empty-log">아직 룰렛 기록이 없습니다.</p>;
  }

  return (
    <ol className="roulette-log">
      {history.map((event) => {
        const label = labels[event.timerId]?.label || event.timerId;
        const action = event.action === "subtract" ? "감소" : "추가";
        const sign = event.action === "subtract" ? "-" : "+";
        return (
          <li
            key={`${event.supporter?.eventId}-${event.at}`}
            className={event.action === "subtract" ? "log-item subtract" : "log-item add"}
          >
            <strong>
              {label} {sign}
              {Math.round(event.seconds / 60)}분
            </strong>
            <span>
              {event.supporter?.name || "익명"} · {Number(event.supporter?.amount || 0).toLocaleString()}원 · {action}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function toMinutesText(optionsSeconds = [1200, 1800]) {
  return optionsSeconds.map((seconds) => Math.round(seconds / 60)).join(", ");
}

function fromMinutesText(value) {
  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0)
    .map((minutes) => minutes * 60);
}
