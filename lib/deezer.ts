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
    nb_fan?: number;
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
    return artists.slice(0, limit).map(toArtist);
}
//turns a deezer artist into our simpler Artist shape
function toArtist(artist: DeezerArtist): Artist {
    return { id: artist.id, name: artist.name, pictureUrl: artist.picture_medium, fans: artist.nb_fan ?? 0};
}
//searches deezer for artists by name, most popular first
export async function searchArtists(query: string, limit = 6): Promise<Artist[]> {
    //asks for extra results so the most popular match is included even if deezer ranks it low
    const res = await fetch(`${DEEZER_API}/search/artist?q=${encodeURIComponent(query)}&limit=25`);
    if (!res.ok) {
      throw new Error(`Deezer artist search failed with status ${res.status}`);
    }
    const json = await res.json();
    if (json.error) {
      throw new Error(`Deezer error: ${json.error.message}`);
    }
    const artists: Artist[] = (json.data ?? []).map(toArtist);
    //biggest fan count first
    artists.sort((a, b) => (b.fans ?? 0) - (a.fans ?? 0));
    return artists.slice(0, limit);
}
//finds the artist someone most likely means by a name, exact spelling first, then most fans
export async function findArtist(name: string): Promise<Artist | null> {
    const artists = await searchArtists(name, 25);
    const exact = artists.find((a) => a.name.toLowerCase() === name.trim().toLowerCase());
    return exact ?? artists[0] ?? null;
}
//gets an artist's most popular songs, only ones where they're the main artist
export async function getArtistSongs(artistId: number, limit = 50): Promise<Song[]> {
    const res = await fetch(`${DEEZER_API}/artist/${artistId}/top?limit=${limit}`);
    if (!res.ok) {
      throw new Error(`Deezer top tracks failed with status ${res.status}`);
    }
    const json = await res.json();
    if (json.error) {
      throw new Error(`Deezer error: ${json.error.message}`);
    }
    const tracks: DeezerTrack[] = json.data ?? [];
    //drops songs where they're only featured, like a dj track with them singing on it
    return tracks.filter((track) => track.preview && track.artist.id === artistId).map(toSong);
}