"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Artist } from "@/lib/types";
import { useUser } from "@/lib/useUser";
import { getPreferences, savePreferences } from "@/lib/preferences";
import { labelClass, primaryButtonClass } from "@/lib/styles";
import Header from "@/components/header";
import ArtistPicker from "@/components/artistPicker";

//the genres people can pick from
const GENRES = [
  "Pop", "Hip-Hop", "R&B", "Rock", "Indie", "Alternative", "Electronic",
  "Jazz", "Soul", "Latin", "Afrobeats", "K-Pop", "Country", "Classical",
];
//the two discovery choices and what they mean
const STYLES: { value: "close" | "surprise"; title: string; description: string }[] = [
  { value: "close", title: "Stick close", description: "Mostly artists like the ones you already love" },
  { value: "surprise", title: "Surprise me", description: "Mix in new sounds I wouldn't expect" },
];

export default function OnboardingPage() {
  const user = useUser();
  const router = useRouter();
  const [genres, setGenres] = useState<string[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
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
        //we only save names, so older picks show up without a photo
        setArtists(prefs.favoriteArtists.map((name) => ({ id: 0, name, pictureUrl: "" })));
        setDiscoveryStyle(prefs.discoveryStyle);
      })
      .catch((err) => console.error(err));
  }, [user]);
  function toggleGenre(genre: string) {
    if (genres.includes(genre)) {
      setGenres(genres.filter((g) => g !== genre));
    } else {
      setGenres([...genres, genre]);
    }
  }
  async function handleSave() {
    if (!user) return;
    if (artists.length === 0) {
      setError("Pick at least one artist you like");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await savePreferences(user.id, {
        genres,
        //saves the exact names deezer gave us so there are no typos
        favoriteArtists: artists.map((a) => a.name),
        discoveryStyle,
      });
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Couldn't save your preferences, try again");
      setSaving(false);
    }
  }
  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <Header />
      {/*only this area scrolls if the screen is short*/}
      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-color:var(--color-line)_transparent] [scrollbar-width:thin]">
        {user === undefined && (
          <p className="mt-10 text-center font-mono text-xs uppercase tracking-[0.3em] text-muted">Loading...</p>
        )}
        {user === null && (
          <div className="flex h-full flex-col items-center justify-center gap-5 px-4 text-center">
            <p className="font-display text-[clamp(32px,6vh,56px)] uppercase leading-none">Log in first</p>
            <p className="text-muted">Preferences are saved to your account.</p>
            <Link href="/login" className={primaryButtonClass}>
              Log in
            </Link>
          </div>
        )}
        {user && (
          <div className="mx-auto max-w-2xl px-4 py-[4vh] sm:px-8">
            <h1 className="font-display text-[clamp(36px,6vh,60px)] uppercase leading-none tracking-wide">
              Tell us what you like
            </h1>
            <p className="mt-2 text-muted">Three quick questions so we can find what fits you.</p>
            {/*question 1, genres*/}
            <section className="mt-8">
              <h2 className={labelClass}>
                <span className="text-accent">01</span> Pick some genres
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {GENRES.map((genre) => {
                  const picked = genres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                        picked ? "border-accent bg-accent text-accent-ink" : "border-line hover:border-cream"
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </section>
            {/*question 2, favorite artists*/}
            <section className="mt-8">
              <h2 className={labelClass}>
                <span className="text-accent">02</span> Up to 3 artists you love
              </h2>
              <div className="mt-3">
                <ArtistPicker selected={artists} onChange={setArtists} />
              </div>
            </section>
            {/*question 3, how adventurous*/}
            <section className="mt-8">
              <h2 className={labelClass}>
                <span className="text-accent">03</span> How adventurous should we be?
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {STYLES.map((style) => {
                  const picked = discoveryStyle === style.value;
                  return (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => setDiscoveryStyle(style.value)}
                      className={`rounded-card border p-4 text-left transition-colors ${
                        picked ? "border-accent bg-accent/10" : "border-line bg-surface/50 hover:border-cream"
                      }`}
                    >
                      <p className={`font-display text-2xl uppercase tracking-wide ${picked ? "text-accent" : ""}`}>
                        {style.title}
                      </p>
                      <p className="mt-1 text-sm text-muted">{style.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <button onClick={handleSave} disabled={saving} className={primaryButtonClass}>
                {saving ? "Saving..." : "Save and start discovering"}
              </button>
              <Link href="/" className="font-mono text-xs uppercase tracking-widest text-muted hover:text-cream">
                Skip for now
              </Link>
            </div>
            {error && <p className="mt-4 text-sm text-accent">{error}</p>}
          </div>
        )}
      </div>
    </main>
  );
}