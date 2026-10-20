import { Song } from "@/lib/types";

const sampleSongs: Song[] = [
  {
    id: 1,
    title: "Test Song One",
    artist: "Test Artist",
    artistId: 100,
    album: "Test Album",
    coverUrl: "",
    previewUrl: "",
  },
  {
    id: 2,
    title: "Test Song Two",
    artist: "Another Artist",
    artistId: 200,
    album: "Another Album",
    coverUrl: "",
    previewUrl: "",
  },
];

export default function Home() {
  return (
    <main>
      <h1>swune</h1>
      <ul>
        {sampleSongs.map((song) => (
          <li key={song.id}>
            {song.title} - {song.artist} ({song.album})
          </li>
        ))}
      </ul>
    </main>
  );
}