import { Song, Artist } from "./types";


const DEEZER_API = "https://api.deezer.com";
type DeezerTrack = {
    id: number;
    title: string;
    preview: string;
    artist: { id: number; name: string };
    album: { title: string; cover_medium: string; cover_big: string };
};
//turns one of Deezer's nested tracks into a simpler Song shape
function toSong(track: DeezerTrack): Song {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist.name,
    artistId: track.artist.id,
    album: track.album.title,
    coverUrl: track.album.cover_big,
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
    //deezer sometimes says ok but sends an error instead of songs
    if (json.error) {
      throw new Error(`Deezer error: ${json.error.message}`);
    }
    const tracks: DeezerTrack[] = json.data ?? [];
    //skips songs with no preview
    return tracks.filter((track) => track.preview).map(toSong);
}

//just the parts of a deezer artist we use
type DeezerArtist = {
    id: number;
    name: string;
    picture_medium: string;
  };
  //gets artists similar to this one for the "if you like this" circles
  export async function getRelatedArtists(artistId: number, limit = 3): Promise<Artist[]> {
    const res = await fetch(`${DEEZER_API}/artist/${artistId}/related?limit=${limit}`);
    if (!res.ok) {
      throw new Error(`Deezer related artists failed with status ${res.status}`);
    }
    const json = await res.json();
    if (json.error) {
        throw new Error(`Deezer error: ${json.error.message}`);
    }
    const artists: DeezerArtist[] = json.data ?? [];
    return artists.slice(0, limit).map((artist) => ({
      id: artist.id,
      name: artist.name,
      pictureUrl: artist.picture_medium,
    }));
}
