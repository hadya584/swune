import { Song } from "@/lib/types";
//shows one song with its cover, info, and a preview player
export default function SongCard({ song }: { song: Song }) {
  return (
    <div className="flex flex-col items-center text-center">
        {/*the yellow offset shadow is our retro signature*/}
        <img
        src={song.coverUrl}
        alt={song.album}
        className="aspect-square w-64 rounded-card object-cover shadow-[6px_6px_0_0_var(--color-accent)] sm:w-80"
        />
        <h2 className="mt-6 font-display text-4xl uppercase leading-none tracking-wide sm:text-5xl">
        {song.title}
        </h2>
        <p className="mt-2 text-lg">{song.artist}</p>
        <p className="font-mono text-xs uppercase tracking-widest text-muted">{song.album}</p>
        {/*color-scheme dark makes the browser's built in player dark too*/}
        <audio
        src={song.previewUrl}
        controls
        autoPlay
        className="mt-5 w-full max-w-sm [color-scheme:dark]"
        />
    </div>
  );
}