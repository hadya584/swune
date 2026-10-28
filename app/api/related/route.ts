import { NextRequest, NextResponse } from "next/server";
import { getRelatedArtists } from "@/lib/deezer";

//handles GET requests to /api/related?artistId=123
export async function GET(request: NextRequest) {
  const artistId = Number(request.nextUrl.searchParams.get("artistId"));
  //missing or not a real number
  if (!artistId) {
    return NextResponse.json(
      { error: "Add an artist id, like /api/related?artistId=860" },
      { status: 400 }
    );
  }
  try {
    const artists = await getRelatedArtists(artistId);
    return NextResponse.json(artists);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Couldn't reach Deezer right now, try again" },
      { status: 502 }
    );
  }
}