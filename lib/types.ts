//why a song is in the queue, shown above the album
export type Reason =
  | { kind: "favorite"; artist: string }
  | { kind: "liked"; artist: string; title: string }
  | { kind: "radio"; artist: string };

export type Song = {
  id: number;
  title: string;
  artist: string;
  artistId: number;
  album: string;
  coverUrl: string;
  previewUrl: string;
  //which artist or liked song this recommendation came from, for the label above the album
  because?: Reason;
};

export type Artist = {
  id: number;
  name: string;
  pictureUrl: string;
  //how many fans they have on deezer, used to sort search results
  fans?: number;
};