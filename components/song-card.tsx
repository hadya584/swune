import { Song } from "@/lib/types";
//shows one song with its cover, info, and a preview player
export default function SongCard({ song }: { song: Song }) {
  return (
    <div>
      <img src={song.coverUrl} alt={song.album} width={250} height={250} />
      <h2>{song.title}</h2>
      <p>{song.artist}</p>
      <p>{song.album}</p>
      <audio src={song.previewUrl} controls autoPlay />
    </div>
  );
}