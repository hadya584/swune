<div align="center">

# SWUNE

**Swipe. Tune. Swoon.** 

A swipe-based music discovery app. Listen to 30-second previews, like or skip, and get recommendations that adapt to your taste with every swipe.

**[Try it live →](https://YOUR-URL.vercel.app)**

![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

</div>

<!-- Screenshots: add images to a /screenshots folder and uncomment.
<p align="center">
  <img src="screenshots/discover.png" width="600" />
</p>
<p align="center">
  <img src="screenshots/mobile.png" width="200" />
  <img src="screenshots/liked.png" width="200" />
  <img src="screenshots/preferences.png" width="200" />
</p>
-->

## Features

- **Swipe to discover.** Drag the album cover right to like or left to skip, or use the buttons or arrow keys. The cards fly off with a tilt animation.
- **Recommendations that learn.** The queue blends your favorite artists, recent likes, and similar artists, and it reacts right away when you like a song.
- **Explainable picks.** Every song shows why it's there: *"Because you like SZA"* or *"Because you liked Kill Bill by SZA."*
- **Two listening modes.** **Your mix** rotates through your taste. **Artist radio** stays on one artist you chose by searching or tapping a related artist.
- **Endless and fresh.** The queue refills itself in the background and never repeats a song you've already liked or skipped.
- **"If you like this."** Related artists are shown beside every song. Tap one to start their radio.
- **Popularity-ranked artist search.** Pick from real artists with photos and fan counts, so names are never misspelled.
- **Accounts that follow you.** Sign up to save likes, skips, and preferences across devices. Guests can try everything first, and their likes move into the account when they sign up.
- **Open anywhere.** Jump to any liked song in Spotify or Apple Music.
- **A custom design.** A dark retro look with a custom audio player and a blurred album-art frame, sized to fit any screen without scrolling.

## How the Recommendations Work

```
Seed artist (a favorite, a recent like, or an artist you picked)
   │
   ├── a few of the seed artist's own songs (shuffled)
   ├── songs from 3–4 related artists
   └── "Surprise me" mode: a second hop to artists related to the related ones
            │
            ▼
   Mix together → remove anything already liked, skipped, or queued → label each song with why it's there
            │
            ▼
   Near the end of the queue, pick a new seed (weighted toward your newest likes) and load more
```

- **Related artists** come from the Deezer API. When Deezer has none for an artist, the app falls back to **Last.fm's similar artists** and looks each one up on Deezer for photos and songs.
- **"Stick close" vs. "Surprise me"** (chosen in preferences) changes the mix: about half familiar artists for "close," mostly new ones for "surprise."
- **Liking a song** immediately slips a few songs from similar artists into the queue, two spots ahead.
- **Songs come from each artist's top tracks by ID**, so search results never include songs by other artists with similar names.

## Tech Stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js (App Router) + React + TypeScript |
| Styling | Tailwind CSS with custom design tokens |
| Animation | Motion (drag gestures and exit animations) |
| Auth & database | Supabase (Auth + PostgreSQL with Row Level Security) |
| Music data | Deezer API (songs, previews, artists), Last.fm API (similar-artist backup) |
| Hosting | Vercel (with preview deployments for each pull request) |

## Architecture

```
app/
├── page.tsx              # Discover screen: swipe card, player, queue logic
├── liked/page.tsx        # Liked songs with Spotify / Apple Music links
├── login/page.tsx        # Log in / sign up
├── onboarding/page.tsx   # Preferences: genres, favorite artists, discovery style
└── api/
    ├── queue/            # Builds a recommendation batch from a seed artist
    ├── related/          # Similar artists (Deezer, with Last.fm backup)
    ├── artists/          # Popularity-ranked artist search
    ├── artist-songs/     # An artist's top tracks by ID
    └── search/           # General song search
components/               # Header, swipe stage, player, related artists, artist picker, ...
lib/
├── queue.ts              # Recommendation engine
├── deezer.ts / lastfm.ts # API clients
├── related.ts            # Deezer-first, Last.fm-backup similar artists
├── likes.ts / skips.ts   # Saved to Supabase when logged in, the browser for guests
├── preferences.ts        # User preferences
└── useAudio.ts / useUser.ts / useArtistSearch.ts   # Custom React hooks
supabase/schema.sql       # Database tables and security policies
```

**Why the music APIs go through API routes:** browsers block direct calls to Deezer (CORS). Routing them through the server also keeps the Last.fm key private and lets the app reshape the data into simple types.

## Database

Three PostgreSQL tables, each protected by **Row Level Security**, so every user can only read and change their own rows:

| Table | Stores |
| --- | --- |
| `liked_songs` | Songs each user liked (one per user per song) |
| `skipped_songs` | Songs each user skipped, so they're never shown again |
| `preferences` | Favorite genres, favorite artists, and discovery style |

The full schema is in [`supabase/schema.sql`](supabase/schema.sql).

## Getting Started

### Prerequisites
- Node.js 20+
- A free [Supabase](https://supabase.com) project
- A free [Last.fm API key](https://www.last.fm/api/account/create)

### Setup

```bash
git clone https://github.com/hadya584/swune.git
cd swune
npm install
```

1. In your Supabase project, open the **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql).
2. Create a `.env.local` file in the project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   LASTFM_API_KEY=your_lastfm_key
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open **http://localhost:3000**.

## Roadmap

- [ ] **Rabbit hole map:** an interactive web of related artists to explore
- [ ] **Voice search:** "What's the song that goes like…?"
- [ ] **Genre-based recommendations** using the genres from preferences
- [ ] **Tests and CI** for the recommendation logic

---

<div align="center">

Built by **[Hadya Osman](https://www.linkedin.com/in/hadya-osman)** · Music data from [Deezer](https://developers.deezer.com) and [Last.fm](https://www.last.fm/api)

</div>
