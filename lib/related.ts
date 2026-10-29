import { Artist } from "./types";
import { getRelatedArtists, findArtist } from "./deezer";
import { getSimilarArtistNames } from "./lastfm";

//similar artists from deezer, or from last.fm when deezer doesn't have any
export async function getSimilarArtists(artistId: number, artistName: string, limit = 3): Promise<Artist[]> {
  const fromDeezer = await getRelatedArtists(artistId, limit).catch(() => [] as Artist[]);
  if (fromDeezer.length > 0) return fromDeezer;
  //deezer had nothing, so get names from last.fm
  const names = await getSimilarArtistNames(artistName, 10).catch(() => [] as string[]);
  //looks each name up on deezer for its photo and id, but only up to 8 so we don't hit deezer's limit
  const found = await Promise.all(
    names.slice(0, Math.min(limit * 2, 8)).map((name) => findArtist(name).catch(() => null))
  );
  //drops any names deezer couldn't find, plus the original artist just in case
  const artists = found.filter((artist): artist is Artist => artist !== null && artist.id !== artistId);
  return artists.slice(0, limit);
}