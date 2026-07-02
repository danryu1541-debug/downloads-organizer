import { useEffect, useState } from "react";
import { TimerBar } from "../components/TimerBar.jsx";
import { getTimer } from "../lib/api.js";
import { subscribeTimer } from "../lib/realtime.js";
import "../styles/overlay.css";

export function OverlayPage() {
  const [state, setState] = useState(null);
  const params = new URLSearchParams(window.location.search);
  const transparent = params.get("transparent") === "1";

  useEffect(() => {
    getTimer().then(setState).catch(console.error);
    return subscribeTimer(setState);
  }, []);

  return (
    <main className={transparent ? "overlay-page transparent" : "overlay-page"}>
      <TimerBar state={state} />
    </main>
  );
}
