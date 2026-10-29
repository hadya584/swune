import { NextRequest, NextResponse } from "next/server";
import { getSimilarArtists } from "@/lib/related";

//handles GET requests to /api/related?artistId=123&name=sia
export async function GET(request: NextRequest) {
  const artistId = Number(request.nextUrl.searchParams.get("artistId"));
  //the name is only needed for the last.fm backup
  const name = request.nextUrl.searchParams.get("name") ?? "";
  if (!artistId) {
    return NextResponse.json(
      { error: "Add an artist id, like /api/related?artistId=860&name=sia" },
      { status: 400 }
    );
  }
  try {
    const artists = await getSimilarArtists(artistId, name);
    return NextResponse.json(artists);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Couldn't find similar artists right now" }, { status: 502 });
  }
}