import { supabase } from "./supabase";

const STORAGE_KEY = "swune-skipped";

//guest skips live in the browser as a list of song ids
function loadGuestSkips(): number[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}
//gets the ids of every song they've skipped
export async function getSkippedIds(userId: string | null): Promise<number[]> {
  if (!userId) return loadGuestSkips();
  const { data, error } = await supabase.from("skipped_songs").select("song_id");
  if (error) throw error;
  return data.map((row) => row.song_id);
}
//remembers a skip so that song doesn't come back
export async function addSkip(userId: string | null, songId: number) {
  if (!userId) {
    const current = loadGuestSkips();
    if (!current.includes(songId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, songId]));
    }
    return;
  }
  const { error } = await supabase
    .from("skipped_songs")
    .upsert({ user_id: userId, song_id: songId }, { onConflict: "user_id,song_id", ignoreDuplicates: true });
  if (error) throw error;
}