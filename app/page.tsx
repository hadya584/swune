"use client";
import { useEffect, useRef, useState } from "react";
import { Song, Artist, Reason } from "@/lib/types";
import { useUser } from "@/lib/useUser";
import { useAudio } from "@/lib/useAudio";
import { getLiked, addLike } from "@/lib/likes";
import { getSkippedIds, addSkip } from "@/lib/skips";
import { getPreferences } from "@/lib/preferences";
import { spotifyUrl } from "@/lib/links";
import { shuffle } from "@/lib/shuffle";
import { DiscoveryStyle } from "@/lib/queue";
import Header from "@/components/header";
import AlbumStage, { SwipeDirection } from "@/components/albumStage";
import RelatedArtists from "@/components/relatedArtists";
import ReasonLabel from "@/components/reasonLabel";
import MarqueeTitle from "@/components/marqueeTitle";
import Player from "@/components/player";
import ActionButton from "@/components/actionButton";
import { HeartIcon, XIcon, ReplayIcon, OpenIcon } from "@/components/icons";

export default function Home() {
  //whos logged in
  const user = useUser();
  const [liked, setLiked] = useState<Song[]>([]);
  const [skippedIds, setSkippedIds] = useState<number[]>([]);
  //their favorite artists and discovery setting from preferences
  const [favorites, setFavorites] = useState<string[]>([]);
  const [style, setStyle] = useState<DiscoveryStyle>("close");

  //song queue
  const [songs, setSongs] = useState<Song[]>([]);
  const [index, setIndex] = useState(0);
  //the artist the queue is built from
  const [query, setQuery] = useState("");
  //"mix" rotates through their favorites and likes, "radio" sticks to one artist they chose
  const [mode, setMode] = useState<"mix" | "radio">("mix");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [related, setRelated] = useState<Artist[]>([]);
  //which way the last card left so it flies off the correct side
  const [direction, setDirection] = useState<SwipeDirection>("right");
  const currentSong = songs[index];
  const artistId = currentSong?.artistId;
  const audio = useAudio(currentSong?.previewUrl);

  //stops us from loading more songs twice at the same time
  const loadingMore = useRef(false);
  const indexRef = useRef(0);
  //the last artist we reacted to
  const lastReactedArtist = useRef<number | null>(null);

  //asks api for a mixed batch of songs starting from one artist
  async function fetchQueue(seed: string): Promise<Song[]> {
    const res = await fetch(`/api/queue?seed=${encodeURIComponent(seed)}&style=${style}`);
    if (!res.ok) throw new Error("request failed");
    return res.json();
  }
  //removes songs already liked, skipped, or have waiting in the queue
  function freshOnly(newSongs: Song[], existing: Song[]) {
    const seen = new Set([...liked.map((s) => s.id), ...skippedIds, ...existing.map((s) => s.id)]);
    return newSongs.filter((song) => !seen.has(song.id));
  }
  //stamps every song in a batch with why it's there
  function withReason(batch: Song[], reason: Reason) {
    return batch.map((song) => ({ ...song, because: reason }));
  }
  //queue keeps going
  function pickNextSeed(): { name: string; reason: Reason } {
    if (mode === "radio") return { name: query, reason: { kind: "radio", artist: query } };
    //most of the time build from a recent like, leaning toward the newest ones
    const recentLikes = liked.slice(-10);
    if (recentLikes.length > 0 && Math.random() < 0.6) {
      //squaring a random number makes small numbers more likely, so newer likes win more often
      const back = Math.floor(Math.random() ** 2 * recentLikes.length);
      const pick = recentLikes[recentLikes.length - 1 - back];
      return { name: pick.artist, reason: { kind: "liked", artist: pick.artist, title: pick.title } };
    }
    //otherwise one of their favorites, or the starting artist if they have none
    const options = favorites.length > 0 ? favorites : [query];
    const name = options[Math.floor(Math.random() * options.length)];
    return { name, reason: { kind: "favorite", artist: name } };
  }

  //loading user data
  //loads likes and skips from the account
  useEffect(() => {
    if (user === undefined) return;
    getLiked(user?.id ?? null)
      .then(setLiked)
      .catch((err) => console.error(err));
    getSkippedIds(user?.id ?? null)
      .then(setSkippedIds)
      .catch((err) => console.error(err));
  }, [user]);
  //picks the starting artist from their favorites, or a default for guests
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
        setFavorites(artists);
        if (prefs) setStyle(prefs.discoveryStyle);
        const pick = artists[Math.floor(Math.random() * artists.length)];
        setQuery(pick ?? "frank ocean");
      })
      .catch(() => setQuery("frank ocean"));
  }, [user]);

  //build queue
  //starts a fresh queue whenever the seed artist or mode changes
  useEffect(() => {
    async function loadSongs() {
      if (!query) return;
      setLoading(true);
      setError("");
      try {
        let batch: Song[];
        if (mode === "radio") {
          batch = withReason(await fetchQueue(query), { kind: "radio", artist: query });
        } else {
          //blends every favorite together, or just the starting artist if they don't have any
          const seeds = favorites.length > 0 ? favorites : [query];
          const perSeed = seeds.length > 1 ? 6 : 15;
          const lists = await Promise.all(
            seeds.map((name) =>
              fetchQueue(name)
                .then((songs) => withReason(songs.slice(0, perSeed), { kind: "favorite", artist: name }))
                .catch(() => [] as Song[])
            )
          );
          batch = shuffle(lists.flat());
        }
        setSongs(freshOnly(batch, []));
        setIndex(0);
      } catch {
        setError("Couldn't load songs, try refreshing");
      } finally {
        setLoading(false);
      }
    }
    loadSongs();
  }, [query, mode]);
  //quietly loads more songs when they're getting close to the end
  useEffect(() => {
    const remaining = songs.length - index;
    if (loading || !query || remaining > 4 || loadingMore.current) return;
    async function refill() {
      loadingMore.current = true;
      try {
        //tries a few starting artists in case one only has songs they've already heard
        for (let attempt = 0; attempt < 3; attempt++) {
          const seed = pickNextSeed();
          const batch = withReason(await fetchQueue(seed.name), seed.reason);
          const fresh = freshOnly(batch, songs);
          if (fresh.length > 0) {
            setSongs((current) => [...current, ...fresh]);
            break;
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        loadingMore.current = false;
      }
    }
    refill();
  }, [index, songs.length, loading, query]);
  //keeps the ref in sync with the real index
  useEffect(() => {
    indexRef.current = index;
  }, [index]);
  //right after they like a song, slip a few similar songs in so the queue reacts right away
  async function queueFromLike(song: Song) {
    //radio mode stays on the artist they chose
    if (mode === "radio") return;
    //don't react to the same artist twice in a row
    if (lastReactedArtist.current === song.artistId) return;
    lastReactedArtist.current = song.artistId;
    try {
      const batch = await fetchQueue(song.artist);
      //just a few, from similar artists instead of more of the same one
      const picks = batch.filter((s) => s.artistId !== song.artistId).slice(0, 3);
      const reason: Reason = { kind: "liked", artist: song.artist, title: song.title };
      setSongs((current) => {
        const fresh = freshOnly(withReason(picks, reason), current);
        //puts them a couple of songs ahead so they show up soon but not instantly
        const insertAt = Math.min(indexRef.current + 2, current.length);
        return [...current.slice(0, insertAt), ...fresh, ...current.slice(insertAt)];
      });
    } catch (err) {
      console.error(err);
    }
  }

  //---- related artists ----
  //gets similar artists whenever the song is by a different artist
  useEffect(() => {
    if (!artistId) return;
    //if they skip to a new artist before this finishes, we ignore the old answer
    let cancelled = false;
    setRelated([]);
    fetch(`/api/related?artistId=${artistId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((artists) => {
        if (!cancelled) setRelated(artists);
      })
      .catch(() => {
        if (!cancelled) setRelated([]);
      });
    return () => {
      cancelled = true;
    };
  }, [artistId]);

  //---- actions ----
  //saves the current song then moves to the next one
  function handleLike() {
    const song = songs[index];
    if (!song) return;
    setDirection("right");
    if (!liked.some((s) => s.id === song.id)) {
      //updates the screen right away instead of waiting on the database
      setLiked([...liked, song]);
      addLike(user?.id ?? null, song).catch((err) => {
        console.error(err);
        //saving failed so take it back off the list
        setLiked((current) => current.filter((s) => s.id !== song.id));
      });
      queueFromLike(song);
    }
    setIndex(index + 1);
  }
  //moves on and remembers the skip so this song never comes back
  function handleSkip() {
    const song = songs[index];
    if (!song) return;
    setDirection("left");
    setSkippedIds([...skippedIds, song.id]);
    //it's fine if saving the skip fails
    addSkip(user?.id ?? null, song.id).catch((err) => console.error(err));
    setIndex(index + 1);
  }
  //dragging right is a like, dragging left is a skip
  function handleSwipe(swipeDirection: SwipeDirection) {
    if (swipeDirection === "right") handleLike();
    else handleSkip();
  }
  //they picked a specific artist so stay on that artist's radio
  function startRadio(name: string) {
    setMode("radio");
    setQuery(name);
  }
  //clicking a related artist starts their radio
  function handlePickArtist(artist: Artist) {
    startRadio(artist.name);
  }
  //goes back to rotating through their favorites
  function handleBackToMix() {
    setMode("mix");
    setQuery(favorites[Math.floor(Math.random() * favorites.length)]);
  }

  //---- keyboard shortcuts ----
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
  }, [index, songs, liked, skippedIds, user, audio, mode, favorites]);

  //---- the page ----
  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      {/*the real audio player, hidden since we built our own controls*/}
      <audio ref={audio.audioRef} src={currentSong?.previewUrl} autoPlay />
      <Header onSearch={startRadio} />
      <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[1.6vh] px-4 py-[1.6vh]">
        {loading && <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">Loading...</p>}
        {error && <p className="text-accent">{error}</p>}
        {!loading && !error && songs.length === 0 && <p className="text-muted">No songs found</p>}
        {!loading && !error && songs.length > 0 && !currentSong && (
          <p className="text-center text-muted">You've heard all of these, pick an artist or search for more!</p>
        )}
        {!loading && !error && currentSong && (
          <>
            {/*why this song is here, plus a way back from radio mode*/}
            <div className="flex max-w-full items-center gap-3 px-4">
              <ReasonLabel
                reason={currentSong.because ?? { kind: mode === "radio" ? "radio" : "favorite", artist: query }}
              />
              {/*only logged in users with favorites have a mix to go back to*/}
              {mode === "radio" && favorites.length > 0 && (
                <button
                  onClick={handleBackToMix}
                  className="shrink-0 font-mono text-[10px] uppercase tracking-[0.3em] text-muted underline underline-offset-4 hover:text-cream"
                >
                  Back to your mix
                </button>
              )}
            </div>
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