import { NextRequest, NextResponse } from "next/server";
import { searchArtists } from "@/lib/deezer";

//handles GET requests to /api/artists?q=something
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "Add a search term, like /api/artists?q=sza" }, { status: 400 });
  }
  try {
    const artists = await searchArtists(query);
    return NextResponse.json(artists);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Couldn't reach Deezer right now, try again" }, { status: 502 });
  }
}