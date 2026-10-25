"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Song } from "@/lib/types";
import SongCard from "@/components/song-card";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabase";
import { getLiked, addLike } from "@/lib/likes";
import { getPreferences } from "@/lib/preferences";

export default function Home() {
  const user = useUser();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<Song[]>([]);
  useEffect(() => {
    async function loadSongs() {
      if (!query) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("request failed");
        const data: Song[] = await res.json();
        setSongs(data);
        setIndex(0);
      } catch {
        setError("Couldn't load songs, try refreshing");
      } finally {
        setLoading(false);
      }
    }
    loadSongs();
  }, [query]);
  //loads likes from the account or the browser once we know who's logged in
  useEffect(() => {
    //still checking who's logged in so wait
    if (user === undefined) return;
    getLiked(user?.id ?? null)
      .then(setLiked)
      .catch((err) => console.error(err));
  }, [user]);
  //picks the first search from their favorite artists, or a default for guests
  useEffect(() => {
    if (user === undefined) return;
    //they already searched something so don't override it
    if (query) return;
    if (user === null) {
      setQuery("frank ocean");
      return;
    }
    getPreferences(user.id)
      .then((prefs) => {
        const artists = prefs?.favoriteArtists ?? [];
        //picks one of their artists at random so it's not the same every visit
        const pick = artists[Math.floor(Math.random() * artists.length)];
        setQuery(pick ?? "frank ocean");
      })
      .catch(() => setQuery("frank ocean"));
  }, [user]);
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim() === "") return;
    setQuery(input.trim());
  }
  //saves the current song then moves to the next one
  function handleLike() {
    const song = songs[index];
    if (!song) return;
    if (!liked.some((s) => s.id === song.id)) {
      //updates the screen right away instead of waiting on the database
      setLiked([...liked, song]);
      addLike(user?.id ?? null, song).catch((err) => {
        console.error(err);
        //saving failed so take it back off the list
        setLiked((current) => current.filter((s) => s.id !== song.id));
      });
    }
    setIndex(index + 1);
  }
  function handleSkip() {
    setIndex(index + 1);
  }
  //lets the arrow keys skip and like
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (!songs[index]) return;
      if (e.key === "ArrowLeft") handleSkip();
      if (e.key === "ArrowRight") handleLike();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, songs, liked, user]);
  const currentSong = songs[index];
  return (
    <main>
      <h1>swune</h1>
      {/*shows who's logged in, or a log in link once we know they're a guest*/}
      {user && (
        <p>
          Logged in as {user.email}{" "}
          <button onClick={() => supabase.auth.signOut()}>Log out</button>
          <Link href="/onboarding">Edit preferences</Link>
        </p>
      )}
      {user === null && <Link href="/login">Log in to save your likes</Link>}
      <form onSubmit={handleSearch}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search an artist"
        />
        <button type="submit">Search</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && songs.length === 0 && <p>No songs found</p>}
      {!loading && !error && currentSong && (
        <div>
          <p>
            Song {index + 1} of {songs.length}
          </p>
          <SongCard key={currentSong.id} song={currentSong} />
          <button onClick={handleSkip}>Skip</button>
          <button onClick={handleLike}>Like</button>
        </div>
      )}
      {!loading && !error && songs.length > 0 && !currentSong && (
        <p>You've gone through all these songs, search another artist!</p>
      )}
      <Link href="/liked">Liked songs ({liked.length})</Link>
    </main>
  );
}