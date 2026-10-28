"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabase";
import { SearchIcon } from "./icons";
import { useArtistSearch } from "@/lib/useArtistSearch";
import ArtistResults from "./artistResults";

type HeaderProps = {
  //only pages that can search pass this in, so other pages won't show the search icon
  onSearch?: (query: string) => void;
};
//top bar with the logo and links, used on every page
export default function Header({ onSearch }: HeaderProps) {
  const user = useUser();
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);
  const [input, setInput] = useState("");
  const { results, clear } = useArtistSearch(input);
//plays songs from the chosen artist and closes the search box
function pickArtist(name: string) {
    if (!onSearch) return;
    onSearch(name);
    setInput("");
    clear();
    setShowSearch(false);
}
    //pressing enter picks the most popular match, or what they typed if nothing matched yet
function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = input.trim();
    if (term === "") return;
    pickArtist(results[0]?.name ?? term);
}
  //makes the link for the page we're on stand out
  function linkClass(href: string) {
    return pathname === href ? "text-cream" : "hover:text-cream";
  }
  //on phones we hide some links while searching so everything fits
  const hideWhileSearching = showSearch ? "hidden sm:inline" : "";
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-8">
      <Link
        href="/"
        className="font-display text-[clamp(34px,5.5vh,56px)] leading-none tracking-wide text-accent"
      >
        SWUNE
      </Link>
      <nav className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.15em] text-muted sm:gap-6 sm:tracking-[0.2em]">
        {onSearch && showSearch && (
          <form onSubmit={handleSearch} className="relative">
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search an artist"
              className="w-36 rounded-card border border-line bg-surface px-3 py-1.5 text-xs normal-case tracking-normal text-cream placeholder:text-muted focus:border-accent focus:outline-none sm:w-48"
            />
            <ArtistResults artists={results} onPick={(artist) => pickArtist(artist.name)} className="right-0 w-72" />
          </form>
        )}
        {onSearch && (
          <button onClick={() => setShowSearch(!showSearch)} aria-label="Search" className="hover:text-cream">
            <SearchIcon />
          </button>
        )}
        <Link href="/" className={`hidden sm:inline ${linkClass("/")}`}>
          Discover
        </Link>
        <Link href="/liked" className={`${linkClass("/liked")} ${hideWhileSearching}`}>
          Liked
        </Link>
        {user && (
          <Link href="/onboarding" className={`hidden sm:inline ${linkClass("/onboarding")}`}>
            Preferences
          </Link>
        )}
        {user && (
          <button
            onClick={() => supabase.auth.signOut()}
            className={`uppercase hover:text-cream ${hideWhileSearching}`}
          >
            Log out
          </button>
        )}
        {user === null && (
          <Link href="/login" className={`text-accent hover:text-cream ${hideWhileSearching}`}>
            Log in
          </Link>
        )}
      </nav>
    </header>
  );
}