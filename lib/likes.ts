import { Song } from "./types";
import { supabase } from "./supabase";

const STORAGE_KEY = "swune-liked";

//what a row in the liked_songs table looks like
type LikedRow = {
  song_id: number;
  title: string;
  artist: string;
  artist_id: number;
  album: string;
  cover_url: string;
  preview_url: string;
};
//the database uses snake_case names so this turns a row into our Song shape
function rowToSong(row: LikedRow): Song {
  return {
    id: row.song_id,
    title: row.title,
    artist: row.artist,
    artistId: row.artist_id,
    album: row.album,
    coverUrl: row.cover_url,
    previewUrl: row.preview_url,
  };
}
//and this goes the other way, from a Song to a database row
function songToRow(song: Song, userId: string) {
  return {
    user_id: userId,
    song_id: song.id,
    title: song.title,
    artist: song.artist,
    artist_id: song.artistId,
    album: song.album,
    cover_url: song.coverUrl,
    preview_url: song.previewUrl,
  };
}
//guest likes live in the browser
function loadGuestLiked(): Song[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}
function saveGuestLiked(songs: Song[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}
//gets liked songs from the account if logged in, otherwise from the browser
export async function getLiked(userId: string | null): Promise<Song[]> {
  if (!userId) return loadGuestLiked();
  const { data, error } = await supabase
    .from("liked_songs")
    .select("*")
    .order("liked_at", { ascending: true });
  if (error) throw error;
  return data.map(rowToSong);
}
//saves one liked song
export async function addLike(userId: string | null, song: Song) {
  if (!userId) {
    const current = loadGuestLiked();
    if (!current.some((s) => s.id === song.id)) {
      saveGuestLiked([...current, song]);
    }
    return;
  }
  //ignoreDuplicates skips it quietly if they already liked this song
  const { error } = await supabase
    .from("liked_songs")
    .upsert(songToRow(song, userId), { onConflict: "user_id,song_id", ignoreDuplicates: true });
  if (error) throw error;
}
//removes one liked song
export async function removeLike(userId: string | null, songId: number) {
  if (!userId) {
    saveGuestLiked(loadGuestLiked().filter((s) => s.id !== songId));
    return;
  }
  const { error } = await supabase
    .from("liked_songs")
    .delete()
    .eq("user_id", userId)
    .eq("song_id", songId);
  if (error) throw error;
}
//after logging in this moves anything they liked as a guest into their account
export async function moveGuestLikesToAccount(userId: string) {
  const guestLikes = loadGuestLiked();
  if (guestLikes.length === 0) return;
  const { error } = await supabase
    .from("liked_songs")
    .upsert(guestLikes.map((song) => songToRow(song, userId)), {
      onConflict: "user_id,song_id",
      ignoreDuplicates: true,
    });
  if (error) throw error;
  //they're safely in the account now so clear the browser copy
  localStorage.removeItem(STORAGE_KEY);
}