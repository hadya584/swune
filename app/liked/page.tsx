"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Song } from "@/lib/types";
import { loadLiked, saveLiked } from "@/lib/likes";
import { spotifyUrl, appleMusicUrl } from "@/lib/links";

export default function LikedPage() {
  const [liked, setLiked] = useState<Song[]>([]);
  //loads saved likes when the page opens
  useEffect(() => {
    setLiked(loadLiked());
  }, []);
  //removes one song from the list and saves the change
  function handleRemove(id: number) {
    const updated = liked.filter((song) => song.id !== id);
    setLiked(updated);
    saveLiked(updated);
  }
  return (
    <main>
      <Link href="/">Back to discovering</Link>
      <h1>Liked Songs ({liked.length})</h1>
      {liked.length === 0 && <p>No liked songs yet, go find some!</p>}
      <ul>
        {liked.map((song) => (
          <li key={song.id}>
            <img src={song.coverUrl} alt={song.album} width={60} height={60} />
            <p>
              {song.title} - {song.artist}
            </p>
            {/*target blank opens it in a new tab so they don't lose our page*/}
            <a href={spotifyUrl(song)} target="_blank" rel="noopener noreferrer">
              Open in Spotify
            </a>{" "}
            <a href={appleMusicUrl(song)} target="_blank" rel="noopener noreferrer">
              Open in Apple Music
            </a>{" "}
            <button onClick={() => handleRemove(song.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </main>
  );
}