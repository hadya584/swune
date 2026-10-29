import { NextRequest, NextResponse } from "next/server";
import { buildQueue, DiscoveryStyle } from "@/lib/queue";

//handles GET requests to /api/queue?seed=sia&style=surprise
export async function GET(request: NextRequest) {
  const seed = request.nextUrl.searchParams.get("seed");
  //anything that isn't "surprise" counts as "close"
  const style: DiscoveryStyle = request.nextUrl.searchParams.get("style") === "surprise" ? "surprise" : "close";
  if (!seed) {
    return NextResponse.json({ error: "Add a seed artist, like /api/queue?seed=sia" }, { status: 400 });
  }
  try {
    const songs = await buildQueue(seed, style);
    return NextResponse.json(songs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Couldn't build a queue right now, try again" }, { status: 502 });
  }
}