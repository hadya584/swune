"use client";
import { useEffect, useState } from "react";
import { Song } from "@/lib/types";
import SongCard from "@/components/song-card";

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  //what's currently typed in the box
  const [input, setInput] = useState("");
  //what we actually searched for, only changes when the button is clicked
  const [query, setQuery] = useState("frank ocean");
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
      } catch {
        setError("Couldn't load songs, try refreshing");
      } finally {
        setLoading(false);
      }
    }
    loadSongs();
  }, [query]);
  //runs when the form is submitted with the button or enter key
  function handleSearch(e: React.FormEvent) {
    //stops the page from reloading which is what forms do by default
    e.preventDefault();
    //ignores empty searches
    if (input.trim() === "") return;
    setQuery(input.trim());
  }
  return (
    <main>
      <h1>Swune</h1>
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
      {!loading && !error && songs.length > 0 && <SongCard song={songs[0]} />}
    </main>
  );
}