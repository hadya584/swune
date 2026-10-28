"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Song } from "@/lib/types";
import { useUser } from "@/lib/useUser";
import { getLiked, removeLike } from "@/lib/likes";
import { spotifyUrl, appleMusicUrl } from "@/lib/links";
import Header from "@/components/header";
import { XIcon } from "@/components/icons";

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
  //newest likes show up at the top
  const newestFirst = [...liked].reverse();
  const pill = "shrink-0 rounded-full border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors hover:border-accent hover:text-accent";
  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <Header />
      <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-4 pt-[3vh] sm:px-8">
        {/*page title with how many songs they have*/}
        <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
          <h1 className="font-display text-[clamp(32px,5.5vh,56px)] uppercase leading-none tracking-wide">
            Liked Songs
          </h1>
          <p className="pb-1 font-mono text-xs uppercase tracking-[0.3em] text-muted">
            {liked.length} {liked.length === 1 ? "track" : "tracks"}
          </p>
        </div>
        {/*nudges guests to log in so they don't lose their likes*/}
        {user === null && liked.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card border border-l-4 border-line border-l-accent bg-surface/60 px-4 py-3">
            <p className="text-sm">You're browsing as a guest. Log in to keep these on any device.</p>
            <Link
              href="/login"
              className="rounded-card bg-accent px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-accent-ink transition-colors hover:bg-accent-hover"
            >
              Log in
            </Link>
          </div>
        )}
        {loading && (
          <p className="mt-10 text-center font-mono text-xs uppercase tracking-[0.3em] text-muted">Loading...</p>
        )}
        {/*shown when they haven't liked anything yet*/}
        {!loading && liked.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
            <p className="font-display text-[clamp(32px,6vh,56px)] uppercase leading-none">Nothing here yet</p>
            <p className="text-muted">Songs you like will show up here.</p>
            <Link
              href="/"
              className="rounded-card bg-accent px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-accent-ink transition-colors hover:bg-accent-hover"
            >
              Start discovering
            </Link>
          </div>
        )}
        {/*only the list scrolls so the page itself never does*/}
        {!loading && liked.length > 0 && (
          <ul className="mt-2  mb-[3vh] min-h-0 flex-1 overflow-y-auto pb-2 [scrollbar-color:var(--color-line)_transparent] [scrollbar-width:thin]">
            {newestFirst.map((song, i) => (
              <li
                key={song.id}
                className="flex items-center gap-3 border-b border-line/60 px-2 py-3 transition-colors hover:bg-surface/60 sm:gap-4"
              >
                {/*track number like the back of a record*/}
                <span className="hidden w-6 shrink-0 font-mono text-xs text-muted sm:block">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <img src={song.coverUrl} alt={song.album} className="size-12 shrink-0 rounded-card object-cover sm:size-14" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{song.title}</p>
                  <p className="truncate font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                    {song.artist} · {song.album}
                  </p>
                </div>
                <a href={spotifyUrl(song)} target="_blank" rel="noopener noreferrer" className={pill}>
                  Spotify
                </a>
                <a href={appleMusicUrl(song)} target="_blank" rel="noopener noreferrer" className={pill}>
                  Apple<span className="hidden sm:inline"> Music</span>
                </a>
                <button
                  onClick={() => handleRemove(song.id)}
                  aria-label={`Remove ${song.title}`}
                  className="shrink-0 rounded-full p-1.5 text-muted transition-colors hover:text-cream"
                >
                  <XIcon size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}