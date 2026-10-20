import { Song } from "./types";

const DEEZER_API = "https://api.deezer.com";
//only parts of deezer track i'm using
type DeezerTrack = {
  id: number;
  title: string;
  preview: string;
  artist: { id: number; name: string };
  album: { title: string; cover_medium: string };
};
//turns one of Deezer's nested tracks into a simpler Song shape
function toSong(track: DeezerTrack): Song {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist.name,
    artistId: track.artist.id,
    album: track.album.title,
    coverUrl: track.album.cover_medium,
    previewUrl: track.preview,
  };
}
//searches Deezer and gives back a list of Songs
export async function searchSongs(query: string): Promise<Song[]> {
  //encodeURIComponent turns spaces and symbols into URL-safe text
  const res = await fetch(`${DEEZER_API}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error(`Deezer search failed with status ${res.status}`);
  }
  const json = await res.json();
  const tracks: DeezerTrack[] = json.data;
  //skips songs with no preview
  return tracks.filter((track) => track.preview).map(toSong);
}