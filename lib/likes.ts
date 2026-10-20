import { Song } from "./types";

const STORAGE_KEY = "swune-liked";

//reads the liked songs saved
export function loadLiked(): Song[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}
//saves the whole liked list
export function saveLiked(songs: Song[]) {
  //turns the list into text so localStorage can hold it
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}