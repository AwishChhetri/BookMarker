# Smart Bookmark App

A modern bookmark manager built with Next.js 14, Supabase, and Tailwind CSS. Features Google OAuth authentication, real-time updates, and a responsive mobile-first design.

## Features

- 🔐 **Google OAuth Authentication** - Secure login with Google
- 📱 **Responsive Design** - Works on desktop and mobile
- ⭐ **Favorites** - Mark bookmarks as favorites
- 🕐 **Recent** - View recently added bookmarks
- 🏷️ **Categories** - Organize bookmarks by category
- 🔍 **Search** - Search bookmarks by title, URL, tags, or category
- 🔄 **Real-time Updates** - Changes sync instantly across devices
- 🎨 **Dark Theme** - Modern dark UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + Database + Realtime)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast + SweetAlert2

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

-- Create policies
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
  ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks"
  ON bookmarks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Enable real-time
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

### 5. Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Update Google OAuth redirect URLs to include your Vercel domain

## Project Structure

```
src/
├── app/
│   ├── auth/callback/route.ts  # OAuth callback handler
│   ├── globals.css              # Global styles + Tailwind
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main page (Auth or Dashboard)
├── components/
│   ├── Auth.tsx                 # Google OAuth login
│   ├── AddBookmarkSidebar.tsx   # Add/Edit bookmark panel
│   ├── BookmarkCard.tsx         # Bookmark card with actions
│   ├── Dashboard.tsx            # Main app dashboard
│   ├── MobileMenu.tsx           # Mobile navigation
│   └── ProfileMenu.tsx          # User profile dropdown
├── lib/
│   ├── supabase-client.ts       # Browser client
│   └── supabase-server.ts       # Server client
└── types/
    └── index.ts                 # TypeScript types
```

## Categories

The app supports these bookmark categories:
- Development, Design, Reference, Work
- Education, Shopping, News, Social
- Entertainment, Other
