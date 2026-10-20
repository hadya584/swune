import { Song } from "./types";

//builds the search text
function searchText(song: Song) {
  return encodeURIComponent(`${song.title} ${song.artist}`);
}
//opens spotify's search for this song, should work without logging in
export function spotifyUrl(song: Song) {
  return `https://open.spotify.com/search/${searchText(song)}`;
}
//open's apple music's search for this song, should work without logging in
export function appleMusicUrl(song: Song) {
  return `https://music.apple.com/us/search?term=${searchText(song)}`;
}