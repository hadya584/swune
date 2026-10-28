import { Artist } from "@/lib/types";

//turns 2140000 into "2.1M fans"
function formatFans(fans?: number) {
  if (!fans) return "";
  if (fans >= 1_000_000) return `${(fans / 1_000_000).toFixed(1)}M fans`;
  if (fans >= 1_000) return `${Math.round(fans / 1_000)}K fans`;
  return `${fans} fans`;
}
type ArtistResultsProps = {
  artists: Artist[];
  onPick: (artist: Artist) => void;
  //lets each page decide where the dropdown sits and how wide it is
  className?: string;
};
//dropdown list of artists with photos and fan counts
export default function ArtistResults({ artists, onPick, className = "" }: ArtistResultsProps) {
  if (artists.length === 0) return null;
  return (
    <ul className={`absolute top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-card border border-line bg-surface shadow-xl ${className}`}>
      {artists.map((artist) => (
        <li key={artist.id}>
          <button
            type="button"
            onClick={() => onPick(artist)}
            className="flex w-full items-center gap-3 px-3 py-2 text-left font-sans text-sm normal-case tracking-normal text-cream transition-colors hover:bg-line/60"
          >
            <img src={artist.pictureUrl} alt="" className="size-9 shrink-0 rounded-full object-cover" />
            <span className="flex-1 truncate">{artist.name}</span>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted">
              {formatFans(artist.fans)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}