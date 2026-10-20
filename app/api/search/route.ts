import { NextRequest, NextResponse } from "next/server";
import { searchSongs } from "@/lib/deezer";

//GET requests to /api/search?q=something
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  //no search entered -- return a 400 error with a helpful message
  if (!query) {
    return NextResponse.json(
      { error: "Add a search term" },
      { status: 400 }
    );
  }

  try {
    const songs = await searchSongs(query);
    return NextResponse.json(songs);
  } catch (error) {
    //log real error to console for debugging, but return a generic error to the user
    console.error(error);
    return NextResponse.json(
      { error: "Couldn't reach Deezer right now, try again" },
      { status: 502 }
    );
  }
}