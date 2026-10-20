"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Song } from "@/lib/types";
import { useUser } from "@/lib/useUser";
import { getLiked, removeLike } from "@/lib/likes";
import { spotifyUrl, appleMusicUrl } from "@/lib/links";

export default function LikedPage() {
  const user = useUser();
  const [liked, setLiked] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  //loads likes once we know who's logged in
  useEffect(() => {
    if (user === undefined) return;
    getLiked(user?.id ?? null)
      .then(setLiked)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);
  //removes it from the screen right away then from storage
  function handleRemove(id: number) {
    const before = liked;
    setLiked(liked.filter((song) => song.id !== id));
    removeLike(user?.id ?? null, id).catch((err) => {
      console.error(err);
      //deleting failed so put the list back how it was
      setLiked(before);
    });
  }
  return (
    <main>
      <Link href="/">Back to discovering</Link>
      <h1>Liked Songs ({liked.length})</h1>
      {/*nudges guests to log in so they don't lose their likes*/}
      {user === null && (
        <p>
          You're browsing as a guest. <Link href="/login">Log in</Link> to save these to your account.
        </p>
      )}
      {loading && <p>Loading...</p>}
      {!loading && liked.length === 0 && <p>No liked songs yet, go find some!</p>}
      <ul>
        {liked.map((song) => (
          <li key={song.id}>
            <img src={song.coverUrl} alt={song.album} width={60} height={60} />
            <p>
              {song.title} - {song.artist}
            </p>
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