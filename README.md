# Smart Bookmark App

A simple bookmark manager built with Next.js, Supabase, and Tailwind CSS. Features Google OAuth authentication and real-time bookmark management.

## Features

- Google OAuth authentication
- Add bookmarks with title and URL
- View bookmarks in real-time
- Private bookmarks (each user sees only their own)
- Delete bookmarks
- Responsive design
- Favorites support
- Recent bookmarks view
- Category filtering
- Mobile-friendly interface

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Authentication + Database)
- **Icons**: Lucide React

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from Settings > API

### 2. Configure Google OAuth in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Providers**
3. Enable **Google** provider
4. Enter your Google OAuth credentials:
   - Client ID: `YOUR_GOOGLE_CLIENT_ID`
   - Client Secret: `YOUR_GOOGLE_CLIENT_SECRET`
5. Add the authorized redirect URL: `https://your-project-ref.supabase.co/auth/v1/callback`

### 3. Create the Bookmarks Table

Run this SQL in the Supabase SQL Editor:

```sql
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  tags TEXT[],
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own bookmarks
CREATE POLICY "Users can insert their own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own bookmarks
CREATE POLICY "Users can update their own bookmarks"
  ON bookmarks FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Enable real-time for bookmarks table
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

### 4. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### 5. Install Dependencies and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Add the environment variables in Vercel's project settings
4. Update the Google OAuth redirect URL to include your Vercel domain

## Project Structure

```
src/
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts    # OAuth callback handler
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page
├── components/
│   ├── Auth.tsx            # Login component
│   ├── AddBookmarkSidebar.tsx # Add/Edit bookmark sidebar
│   ├── BookmarkCard.tsx    # Bookmark card with favorite support
│   ├── BookmarkList.tsx    # Bookmark list with real-time
│   ├── Dashboard.tsx       # Main dashboard
│   ├── MobileMenu.tsx      # Mobile navigation menu
│   └── ProfileMenu.tsx     # User profile menu
├── lib/
│   ├── supabase-client.ts  # Supabase client (browser)
│   └── supabase-server.ts  # Supabase client (server)
└── types/
    └── index.ts            # Shared types
```

## License

MIT
