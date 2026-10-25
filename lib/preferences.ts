import { supabase } from "./supabase";

export type Preferences = {
  genres: string[];
  favoriteArtists: string[];
  discoveryStyle: "close" | "surprise";
};
//gets a user's saved preferences, or null if they haven't filled them out yet
export async function getPreferences(userId: string): Promise<Preferences | null> {
  const { data, error } = await supabase
    .from("preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  //turns the database's snake_case names into ours
  return {
    genres: data.genres,
    favoriteArtists: data.favorite_artists,
    discoveryStyle: data.discovery_style,
  };
}
//creates their preferences the first time, updates them after that
export async function savePreferences(userId: string, prefs: Preferences) {
  const { error } = await supabase.from("preferences").upsert({
    user_id: userId,
    genres: prefs.genres,
    favorite_artists: prefs.favoriteArtists,
    discovery_style: prefs.discoveryStyle,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}