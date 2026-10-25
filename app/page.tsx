"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Song, Artist } from "@/lib/types";
import { useUser } from "@/lib/useUser";
import { useAudio } from "@/lib/useAudio";
import { supabase } from "@/lib/supabase";
import { getLiked, addLike } from "@/lib/likes";
import { getPreferences } from "@/lib/preferences";
import { spotifyUrl } from "@/lib/links";
import AlbumStage, { SwipeDirection } from "@/components/albumStage";
import RelatedArtists from "@/components/relatedArtists";
import Player from "@/components/player";
import ActionButton from "@/components/actionButton";
import { HeartIcon, XIcon, ReplayIcon, OpenIcon, SearchIcon } from "@/components/icons";
import MarqueeTitle from "@/components/marqueeTitle";

export default function Home() {
  const user = useUser();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<Song[]>([]);
  //which way the last card left so it flies off the correct side
  const [direction, setDirection] = useState<SwipeDirection>("right");
  const [related, setRelated] = useState<Artist[]>([]);
  //whether the search box in the nav is open
  const [showSearch, setShowSearch] = useState(false);
  const currentSong = songs[index];
  const artistId = currentSong?.artistId;
  const audio = useAudio(currentSong?.previewUrl);
  useEffect(() => {
    async function loadSongs() {
      //nothing to search yet
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
    if (user === undefined) return;
    getLiked(user?.id ?? null)
      .then(setLiked)
      .catch((err) => console.error(err));
  }, [user]);
  //picks the first search from their favorite artists, or a default for guests
  useEffect(() => {
    if (user === undefined) return;
    if (query) return;
    if (user === null) {
      setQuery("frank ocean");
      return;
    }
    getPreferences(user.id)
      .then((prefs) => {
        const artists = prefs?.favoriteArtists ?? [];
        const pick = artists[Math.floor(Math.random() * artists.length)];
        setQuery(pick ?? "frank ocean");
      })
      .catch(() => setQuery("frank ocean"));
  }, [user]);
  //gets similar artists whenever the song is by a different artist
  useEffect(() => {
    if (!artistId) return;
    fetch(`/api/related?artistId=${artistId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setRelated)
      .catch(() => setRelated([]));
  }, [artistId]);
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim() === "") return;
    setQuery(input.trim());
    //clears and closes the search box after searching
    setInput("");
    setShowSearch(false);
  }
  //saves the current song then moves to the next one
  function handleLike() {
    const song = songs[index];
    if (!song) return;
    setDirection("right");
    if (!liked.some((s) => s.id === song.id)) {
      setLiked([...liked, song]);
      addLike(user?.id ?? null, song).catch((err) => {
        console.error(err);
        setLiked((current) => current.filter((s) => s.id !== song.id));
      });
    }
    setIndex(index + 1);
  }
  function handleSkip() {
    if (!songs[index]) return;
    setDirection("left");
    setIndex(index + 1);
  }
  //dragging right is a like, dragging left is a skip
  function handleSwipe(swipeDirection: SwipeDirection) {
    if (swipeDirection === "right") handleLike();
    else handleSkip();
  }
  //starts playing songs from an artist they clicked on
  function handlePickArtist(artist: Artist) {
    setQuery(artist.name);
  }
  //arrow keys like and skip, space plays and pauses
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") {
        //stops the page from scrolling, which is what space normally does
        e.preventDefault();
        audio.toggle();
      }
      if (e.key === "ArrowLeft") handleSkip();
      if (e.key === "ArrowRight") handleLike();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, songs, liked, user, audio]);
  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      {/*the real audio player, hidden since we built our own controls*/}
      <audio ref={audio.audioRef} src={currentSong?.previewUrl} autoPlay />
      <header className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3.5 sm:px-8 sm:py-4">
        <Link href="/" className="font-display text-3xl tracking-wide text-accent">
          SWUNE
        </Link>
        <nav className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.15em] text-muted sm:gap-6 sm:tracking-[0.2em]">
          {/*search box only shows up after clicking the icon*/}
          {showSearch && (
            <form onSubmit={handleSearch}>
              <input
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search an artist"
                className="w-32 rounded-card border border-line bg-surface px-3 py-1.5 text-xs normal-case tracking-normal text-cream placeholder:text-muted focus:border-accent focus:outline-none sm:w-48"
              />
            </form>
          )}
          <button onClick={() => setShowSearch(!showSearch)} aria-label="Search" className="hover:text-cream">
            <SearchIcon />
          </button>
          <Link href="/liked" className="hover:text-cream">
            Liked
          </Link>
          {user && (
            <Link href="/onboarding" className="hidden hover:text-cream sm:inline">
              Preferences
            </Link>
          )}
          {user && (
            <button onClick={() => supabase.auth.signOut()} className="uppercase hover:text-cream">
              Log out
            </button>
          )}
          {user === null && (
            <Link href="/login" className="text-accent hover:text-cream">
              Log in
            </Link>
          )}
        </nav>
      </header>
      <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[1.6vh] px-4 py-[1.6vh]">
        {loading && <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">Loading...</p>}
        {error && <p className="text-accent">{error}</p>}
        {!loading && !error && songs.length === 0 && <p className="text-muted">No songs found</p>}
        {!loading && !error && songs.length > 0 && !currentSong && (
          <p className="text-center text-muted">You've heard all of these, pick an artist or search for more!</p>
        )}
        {!loading && !error && currentSong && (
          <>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
              Because you like <span className="text-accent">{query}</span>
            </p>
            {/*album in the middle with related artists on the right*/}
            <div className="flex w-full flex-col items-center gap-[1.6vh] sm:w-auto sm:flex-row sm:gap-7">
              {/*empty space the same width as the artists so the album stays centered*/}
              <div className="hidden w-40 sm:block" />
              <AlbumStage song={currentSong} direction={direction} onSwipe={handleSwipe} />
              <RelatedArtists artists={related} onPick={handlePickArtist} />
            </div>
            <MarqueeTitle text={currentSong.title} />
            <p className="-mt-[1vh] text-center">
              {currentSong.artist} ·{" "}
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                {currentSong.album}
              </span>
            </p>
            <Player
              playing={audio.playing}
              currentTime={audio.currentTime}
              duration={audio.duration}
              onToggle={audio.toggle}
              onSeek={audio.seek}
            />
            <div className="flex items-center gap-5 sm:gap-8">
              <ActionButton label="Replay" variant="small" onClick={audio.replay}>
                <ReplayIcon />
              </ActionButton>
              <ActionButton label="Skip" variant="skip" onClick={handleSkip}>
                <XIcon />
              </ActionButton>
              <ActionButton label="Like" variant="like" onClick={handleLike}>
                <HeartIcon />
              </ActionButton>
              <ActionButton label="Open" variant="small" href={spotifyUrl(currentSong)}>
                <OpenIcon />
              </ActionButton>
            </div>
          </>
        )}
      </section>
    </main>
  );
}