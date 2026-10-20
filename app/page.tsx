"use client";
import { useEffect, useState } from "react";
import { Song } from "@/lib/types";
import SongCard from "@/components/song-card";
import Link from "next/link";
import { loadLiked, saveLiked } from "@/lib/likes";

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  //what's currently typed in the box
  const [input, setInput] = useState("");
  //what we searched, only changes when button is clicked
  const [query, setQuery] = useState("frank ocean");
  //which song in the list we're currently on
  const [index, setIndex] = useState(0);
  //every song the user has liked so far
  const [liked, setLiked] = useState<Song[]>([]);
  //reruns every time query changes
  useEffect(() => {
    async function loadSongs() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("request failed");
        const data: Song[] = await res.json();
        setSongs(data);
        //new search so start back at the first song
        setIndex(0);
      } catch {
        setError("Couldn't load songs, try refreshing");
      } finally {
        setLoading(false);
      }
    }
    loadSongs();
  }, [query]);
  //pulls in any songs liked before a refresh or from another page
  useEffect(() => {
    setLiked(loadLiked());
  }, []);
  //runs when the form is submitted with the button or enter key
  function handleSearch(e: React.FormEvent) {
    //stops the page from reloading which is what forms do by default
    e.preventDefault();
    //ignores empty searches
    if (input.trim() === "") return;
    setQuery(input.trim());
  }
  //saves the current song then moves to the next one
  function handleLike() {
    const song = songs[index];
    //stops here if there's no song left to like
    if (!song) return;
    if (!liked.some((s) => s.id === song.id)) {
      const updated = [...liked, song];
      setLiked(updated);
      //also saves it to the browser so it survives refreshes
      saveLiked(updated);
    }
    setIndex(index + 1);
  }
  //just moves on without saving
  function handleSkip() {
    setIndex(index + 1);
  }
  const currentSong = songs[index];

  //lets the arrow keys skip and like
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      //ignores arrow keys while typing in the search box
      if (e.target instanceof HTMLInputElement) return;
      //nothing to like or skip if we ran out of songs
      if (!songs[index]) return;
      if (e.key === "ArrowLeft") handleSkip();
      if (e.key === "ArrowRight") handleLike();
    }
    window.addEventListener("keydown", handleKey);
    //removes the old listener
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, songs, liked]);

  return (
    <main>
      <h1>swune</h1>
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
      {!loading && !error && songs.length === 0 && <p>No songs</p>}
      {!loading && !error && currentSong && (
        <div>
            <p>
              Song {index + 1} of {songs.length}
            </p>
            {/*key makes react treat each song as a new card so the audio resets*/}
            <SongCard key={currentSong.id} song={currentSong} />
            <button onClick={handleSkip}>Skip</button>
            <button onClick={handleLike}>Like</button>
          </div>
        )}
        {/*ran out of songs from this search*/}
        {!loading && !error && songs.length > 0 && !currentSong && (
          <p>You've gone through all these songs, search another artist!</p>
        )}
        <Link href="/liked">Liked songs ({liked.length})</Link>
    </main>
  );
}