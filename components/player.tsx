import { PlayIcon, PauseIcon } from "./icons";

//turns seconds like 7.4 into "0:07"
function formatTime(seconds: number) {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
type PlayerProps = {
  playing: boolean;
  currentTime: number;
  duration: number;
  onToggle: () => void;
  onSeek: (percent: number) => void;
};
//see through navy pill with a yellow play button and progress bar
export default function Player({ playing, currentTime, duration, onToggle, onSeek }: PlayerProps) {
  const percent = duration ? (currentTime / duration) * 100 : 0;
  //works out where on the bar they clicked and jumps there
  function handleBarClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    onSeek((e.clientX - rect.left) / rect.width);
  }
  return (
    <div className="flex w-full max-w-md items-center gap-3 rounded-full border border-line bg-surface/60 py-2 pl-2 pr-5 font-mono text-[10px] text-muted">
      <button
        onClick={onToggle}
        aria-label={playing ? "Pause" : "Play"}
        className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-accent-ink transition-colors hover:bg-accent-hover"
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <span>{formatTime(currentTime)}</span>
      {/*the taller invisible area makes the thin bar easier to click*/}
      <div onClick={handleBarClick} className="flex h-4 flex-1 cursor-pointer items-center">
        <div className="relative h-1 w-full rounded-full bg-line">
          <div className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${percent}%` }} />
          <div
            className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream"
            style={{ left: `${percent}%` }}
          />
        </div>
      </div>
      <span>{formatTime(duration)}</span>
    </div>
  );
}