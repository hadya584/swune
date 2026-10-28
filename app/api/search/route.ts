import { NextRequest, NextResponse } from "next/server";
import { searchSongs } from "@/lib/deezer";

//handles GET requests to /api/search?q=something
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  //no search term so tell the caller what went wrong
  if (!query) {
    return NextResponse.json(
      { error: "Add a search term, like /api/search?q=frank ocean" },
      { status: 400 }
    );
  }
  try {
    const songs = await searchSongs(query);
    return NextResponse.json(songs);
  } catch (error) {
    //logs the real error but sends back a friendly one
    console.error(error);
    return NextResponse.json(
      { error: "Couldn't reach Deezer right now, try again" },
      { status: 502 }
    );
  }
}