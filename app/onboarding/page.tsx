"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/lib/useUser";
import { getPreferences, savePreferences } from "@/lib/preferences";

//the genres people can pick from
const GENRES = [
  "Pop", "Hip-Hop", "R&B", "Rock", "Indie", "Alternative", "Electronic",
  "Jazz", "Soul", "Latin", "Afrobeats", "K-Pop", "Country", "Classical",
];

export default function OnboardingPage() {
  const user = useUser();
  const router = useRouter();
  const [genres, setGenres] = useState<string[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  const [artistInput, setArtistInput] = useState("");
  const [discoveryStyle, setDiscoveryStyle] = useState<"close" | "surprise">("close");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  //fills in their old answers if they're coming back to edit
  useEffect(() => {
    if (!user) return;
    getPreferences(user.id)
      .then((prefs) => {
        if (!prefs) return;
        setGenres(prefs.genres);
        setArtists(prefs.favoriteArtists);
        setDiscoveryStyle(prefs.discoveryStyle);
      })
      .catch((err) => console.error(err));
  }, [user]);
  //checks the genre if it's not picked, unchecks it if it is
  function toggleGenre(genre: string) {
    if (genres.includes(genre)) {
      setGenres(genres.filter((g) => g !== genre));
    } else {
      setGenres([...genres, genre]);
    }
  }
  //adds a favorite artist, up to 3
  function handleAddArtist(e: React.FormEvent) {
    e.preventDefault();
    const name = artistInput.trim();
    if (name === "" || artists.length >= 3) return;
    //skips it if they already added that artist
    if (artists.some((a) => a.toLowerCase() === name.toLowerCase())) return;
    setArtists([...artists, name]);
    setArtistInput("");
  }
  function handleRemoveArtist(name: string) {
    setArtists(artists.filter((a) => a !== name));
  }
  async function handleSave() {
    if (!user) return;
    //we need at least one artist so we know where to start
    if (artists.length === 0) {
      setError("Add at least one artist you like");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await savePreferences(user.id, { genres, favoriteArtists: artists, discoveryStyle });
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Couldn't save your preferences, try again");
      setSaving(false);
    }
  }
  //still checking who's logged in
  if (user === undefined) return <p>Loading...</p>;
  //preferences are only for logged in users
  if (user === null) {
    return (
      <main>
        <p>You need to be logged in to set preferences.</p>
        <Link href="/login">Log in</Link>
      </main>
    );
  }
  return (
    <main>
      <h1>Tell us what you like</h1>
      <h2>1. Pick some genres</h2>
      {GENRES.map((genre) => (
        <label key={genre}>
          <input
            type="checkbox"
            checked={genres.includes(genre)}
            onChange={() => toggleGenre(genre)}
          />
          {genre}{" "}
        </label>
      ))}
      <h2>2. Add up to 3 artists you love</h2>
      <form onSubmit={handleAddArtist}>
        <input
          value={artistInput}
          onChange={(e) => setArtistInput(e.target.value)}
          placeholder="Artist name"
          disabled={artists.length >= 3}
        />
        <button type="submit" disabled={artists.length >= 3}>
          Add
        </button>
      </form>
      <ul>
        {artists.map((name) => (
          <li key={name}>
            {name} <button onClick={() => handleRemoveArtist(name)}>Remove</button>
          </li>
        ))}
      </ul>
      <h2>3. How adventurous should we be?</h2>
      <label>
        <input
          type="radio"
          checked={discoveryStyle === "close"}
          onChange={() => setDiscoveryStyle("close")}
        />
        Stick close to what I like
      </label>
      <br />
      <label>
        <input
          type="radio"
          checked={discoveryStyle === "surprise"}
          onChange={() => setDiscoveryStyle("surprise")}
        />
        Surprise me with new stuff
      </label>
      <br />
      <br />
      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save and start discovering"}
      </button>{" "}
      <Link href="/">Skip for now</Link>
      {error && <p>{error}</p>}
    </main>
  );
}