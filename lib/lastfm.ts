const LASTFM_API = "https://ws.audioscrobbler.com/2.0/";

//asks last.fm for artists similar to this one and returns just their names
export async function getSimilarArtistNames(artistName: string, limit = 10): Promise<string[]> {
  const apiKey = process.env.LASTFM_API_KEY;
  //no key or no name, so skip last.fm instead of crashing
  if (!apiKey || !artistName) return [];
  const params = new URLSearchParams({
    method: "artist.getsimilar",
    artist: artistName,
    api_key: apiKey,
    format: "json",
    limit: String(limit),
    //fixes small typos in the artist name
    autocorrect: "1",
  });
  const res = await fetch(`${LASTFM_API}?${params}`);
  if (!res.ok) {
    throw new Error(`Last.fm failed with status ${res.status}`);
  }
  const json = await res.json();
  //last.fm sends back an error number when it doesn't know the artist
  if (json.error) return [];
  const artists: { name: string }[] = json.similarartists?.artist ?? [];
  return artists.map((artist) => artist.name);
}