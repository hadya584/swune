"use client";
import { useEffect, useState } from "react";
import { Artist } from "./types";

//searches deezer artists as someone types, waiting until they pause
export function useArtistSearch(input: string) {
  const [results, setResults] = useState<Artist[]>([]);
  useEffect(() => {
    const term = input.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      fetch(`/api/artists?q=${encodeURIComponent(term)}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((artists: Artist[]) => {
          if (!cancelled) setResults(artists);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        });
    }, 300);
    //if they keep typing, cancel the old timer and ignore old answers
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [input]);
  //lets whoever uses this close the dropdown after picking someone
  function clear() {
    setResults([]);
  }
  return { results, clear };
}