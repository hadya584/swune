import { NextRequest, NextResponse } from "next/server";
import { findArtist, getArtistSongs } from "@/lib/deezer";

//handles GET requests to /api/artist-songs?name=sia
export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "Add an artist name, like /api/artist-songs?name=sia" }, { status: 400 });
  }
  try {
    const artist = await findArtist(name);
    //no artist by that name so send back an empty list
    if (!artist) return NextResponse.json([]);
    const songs = await getArtistSongs(artist.id);
    return NextResponse.json(songs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Couldn't reach Deezer right now, try again" }, { status: 502 });
  }
}