export type Song = {
    id: number;
    title: string;
    artist: string;
    artistId: number;
    album: string;
    coverUrl: string;
    previewUrl: string;
};
export type Artist = {
    id: number;
    name: string;
    pictureUrl: string;
    fans?: number;
};