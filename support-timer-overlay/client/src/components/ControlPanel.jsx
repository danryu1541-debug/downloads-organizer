import { Pause, Play, RotateCcw } from "lucide-react";
import { pauseTimer, resetTimer, startTimer } from "../lib/api.js";

export function ControlPanel({ onChange }) {
  const run = async (action) => {
    const next = await action();
    onChange(next);
  };

  return (
    <div className="controls">
      <button onClick={() => run(startTimer)} title="Start">
        <Play size={18} />
        시작
      </button>
      <button onClick={() => run(pauseTimer)} title="Pause">
        <Pause size={18} />
        정지
      </button>
      <button onClick={() => run(resetTimer)} title="Reset">
        <RotateCcw size={18} />
        초기화
      </button>
    </div>
  );
}
