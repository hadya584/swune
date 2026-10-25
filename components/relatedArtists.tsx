import { Artist } from "@/lib/types";

type RelatedArtistsProps = {
  artists: Artist[];
  onPick: (artist: Artist) => void;
};
//circles of similar artists, clicking one starts playing from that artist
export default function RelatedArtists({ artists, onPick }: RelatedArtistsProps) {
  //keeps the same space so the album doesn't shift while these load
  if (artists.length === 0) return <div className="hidden w-40 sm:block" />;
  return (
    <div className="flex items-start justify-center gap-6 sm:w-40 sm:flex-col sm:items-center sm:gap-[2.6vh]">
      <p className="hidden text-center font-mono text-[10px] uppercase leading-relaxed tracking-[0.3em] text-muted sm:block">
        If you like this
      </p>
      {artists.map((artist) => (
        <button
          key={artist.id}
          onClick={() => onPick(artist)}
          className="group flex flex-col items-center gap-2 text-center"
        >
          <img
            src={artist.pictureUrl}
            alt={artist.name}
            className="size-14 rounded-full border-2 border-line object-cover transition-colors group-hover:border-accent sm:size-[clamp(64px,11vh,104px)]"
          />
          <span className="max-w-36 truncate font-mono text-[10px] uppercase tracking-[0.15em] group-hover:text-accent sm:text-[11px]">
            {artist.name}
          </span>
        </button>
      ))}
    </div>
  );
}