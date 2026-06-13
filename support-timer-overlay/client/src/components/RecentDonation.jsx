export function RecentDonation({ state }) {
  const history = getHistory(state).slice(0, 3);
  const labels = state?.settings?.timers || {};

  return (
    <div className="recent-box">
      <div className="recent-box-head">
        <span>최근 룰렛</span>
        <small>최근 3개</small>
      </div>
      {history.length === 0 ? (
        <p className="empty-log">테스트 버튼으로 결과를 확인할 수 있습니다.</p>
      ) : (
        <ol className="compact-log">
          {history.map((event) => (
            <RouletteItem key={`${event.supporter?.eventId}-${event.at}`} event={event} labels={labels} />
          ))}
        </ol>
      )}
    </div>
  );
}

function RouletteItem({ event, labels }) {
  const label = labels[event.timerId]?.label || event.timerId;
  const action = event.action === "subtract" ? "감소" : "추가";
  const sign = event.action === "subtract" ? "-" : "+";

  return (
    <li className={event.action === "subtract" ? "log-item subtract" : "log-item add"}>
      <strong>
        {label} {sign}
        {Math.round(event.seconds / 60)}분
      </strong>
      <small>
        {event.supporter?.name || "익명"} · {Number(event.supporter?.amount || 0).toLocaleString()}원 · {action}
      </small>
    </li>
  );
}

function getHistory(state) {
  if (state?.eventHistory?.length) return state.eventHistory;
  if (state?.recentEvent) return [state.recentEvent];
  return [];
}
