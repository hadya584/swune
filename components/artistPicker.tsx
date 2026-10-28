"use client";
import { useState } from "react";
import { Artist } from "@/lib/types";
import { inputClass } from "@/lib/styles";
import { useArtistSearch } from "@/lib/useArtistSearch";
import { XIcon } from "./icons";
import ArtistResults from "./artistResults";

type ArtistPickerProps = {
  selected: Artist[];
  onChange: (artists: Artist[]) => void;
  max?: number;
};

//search box that suggests real artists so names are always spelled right
export default function ArtistPicker({ selected, onChange, max = 3 }: ArtistPickerProps) {
  const [input, setInput] = useState("");
  const full = selected.length >= max;
  const { results, clear } = useArtistSearch(input);
  function handlePick(artist: Artist) {
    //skips it if they already picked this artist
    if (!selected.some((a) => a.name === artist.name)) {
      onChange([...selected, artist]);
    }
    setInput("");
    clear();
  }
  function handleRemove(name: string) {
    onChange(selected.filter((a) => a.name !== name));
  }
  return (
    <div>
      {/*the artists they've picked so far*/}
      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selected.map((artist) => (
            <span
              key={artist.name}
              className="flex items-center gap-2 rounded-full border border-accent bg-surface py-1 pl-1 pr-3 text-sm"
            >
              {/*older saved artists might not have a photo, so show their first letter instead*/}
              {artist.pictureUrl ? (
                <img src={artist.pictureUrl} alt="" className="size-7 rounded-full object-cover" />
              ) : (
                <span className="grid size-7 place-items-center rounded-full bg-line font-mono text-xs uppercase">
                  {artist.name[0]}
                </span>
              )}
              {artist.name}
              <button
                type="button"
                onClick={() => handleRemove(artist.name)}
                aria-label={`Remove ${artist.name}`}
                className="text-muted hover:text-cream"
              >
                <XIcon size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
      {/*search box with a dropdown of matching artists*/}
      <div className="relative">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={full}
          placeholder={full ? `You've picked ${max}, remove one to change` : "Search for an artist"}
          className={inputClass}
        />
        <ArtistResults artists={results} onPick={handlePick} className="inset-x-0" />
      </div>
    </div>
  );
}