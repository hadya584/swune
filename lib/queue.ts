import { Song, Artist } from "./types";
import { findArtist, getArtistSongs, getRelatedArtists } from "./deezer";
import { shuffle } from "./shuffle";

export type DiscoveryStyle = "close" | "surprise";

//how the mix changes depending on how adventurous they want to be
const MIX = {
    close: { seedSongs: 6, relatedArtists: 3, songsPerArtist: 2, secondHop: 0 },
    surprise: { seedSongs: 3, relatedArtists: 4, songsPerArtist: 2, secondHop: 2 },
};

//builds a batch of songs starting from one artist and branching out to similar ones
export async function buildQueue(seedName: string, style: DiscoveryStyle): Promise<Song[]> {
    const seed = await findArtist(seedName);
    if (!seed) return [];
    const mix = MIX[style];
    //a few of the seed artist's own songs, shuffled so it's not always their biggest hit first
    const seedSongs = shuffle(await getArtistSongs(seed.id)).slice(0, mix.seedSongs);
    //similar artists picked at random from a bigger list so it changes every time
    const related = shuffle(await getRelatedArtists(seed.id, 15));
    let picked: Artist[] = related.slice(0, mix.relatedArtists);
    //surprise mode also jumps one step further, to artists similar to the similar ones
    if (mix.secondHop > 0 && picked.length > 0) {
        const hop = shuffle(await getRelatedArtists(picked[0].id, 15));
        const extra = hop.filter((a) => a.id !== seed.id && !picked.some((p) => p.id === a.id));
        picked = [...picked, ...extra.slice(0, mix.secondHop)];
    }
    //grabs a couple of songs from every picked artist at the same time
    const relatedSongLists = await Promise.all(
        picked.map((artist) =>
        getArtistSongs(artist.id, 15)
            .then((songs) => shuffle(songs).slice(0, mix.songsPerArtist))
            //if one artist fails we just skip them instead of losing the whole batch
            .catch(() => [] as Song[])
        )
    );
    const allSongs = [...seedSongs, ...relatedSongLists.flat()];
    //mixes them all together, the page adds the reason for each song
    return shuffle(allSongs);
}