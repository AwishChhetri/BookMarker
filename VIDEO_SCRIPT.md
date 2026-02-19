# Smart Bookmark App - Video Walkthrough Script

## Intro (30 seconds)

> "Hi, I'm [Your Name] and today I'll be walking you through the Smart Bookmark App I built. This is a simple bookmark manager that allows users to save and organize their favorite links. The app features Google OAuth authentication, real-time updates, and private bookmarks - meaning each user only sees their own saved links."

---

## Overall Approach (45 seconds)

> "Let me start with my overall approach. The requirements were to build a bookmark manager with Next.js, Supabase, and Tailwind CSS that supports Google authentication and real-time updates.
>
> I chose a modular component architecture. The app is split into:
> - **Auth component** - handles the login screen
> - **Dashboard component** - the main layout after login
> - **BookmarkForm** - for adding new bookmarks
> - **BookmarkList** - displays bookmarks with delete functionality
>
> This separation makes the code easier to maintain and test. I also use TypeScript throughout for type safety."

---

## Authentication & User Privacy (1 minute 30 seconds)

> "Now let's talk about authentication and user privacy - this is one of the most important parts of the app.
>
> **For authentication**, I used Supabase's OAuth integration with Google. When a user clicks 'Sign in with Google', they're redirected to Google's consent screen. After approval, Google redirects back to our callback route where Supabase exchanges the authorization code for a session.
>
> Here in the code [show `src/app/auth/callback/route.ts`], you can see the callback handler that exchanges the code and sets the session cookies.
>
> **For user privacy**, I implemented Row Level Security or RLS in Supabase. This is crucial - it ensures that database queries are automatically filtered based on the authenticated user.
>
> Let me show you the SQL I used [show README SQL section]:
> - First, I enabled RLS on the bookmarks table
> - Then I created policies that only allow users to view, insert, and delete their own bookmarks using `auth.uid() = user_id`
>
> This means even if someone tried to bypass the frontend and query the database directly, they would only see their own bookmarks. The database itself enforces privacy."

---

## Real-Time Updates (1 minute)

> "The third key feature is real-time updates. When you add or delete a bookmark, the list updates instantly without needing to refresh the page.
>
> I implemented this using Supabase's real-time subscriptions. Let me show you in the BookmarkList component [show `src/components/BookmarkList.tsx`].
>
> Here I set up a channel subscription that listens for any changes to the bookmarks table - that includes INSERT, UPDATE, and DELETE events. When any change is detected that matches the current user's ID, it triggers a re-fetch of the bookmarks.
>
> This uses WebSocket connections under the hood, so updates are near-instantaneous. You can see it in action if I open the app in two browser windows - changes in one immediately appear in the other."

---

## Code Walkthrough (1 minute 15 seconds)

> "Let me quickly walk through the key files:
>
> **The page.tsx** [show file] - This is the entry point. It checks if a user session exists using the server-side Supabase client. If there's no session, it shows the Auth component. If authenticated, it renders the Dashboard.
>
> **The BookmarkForm** [show file] - Handles adding new bookmarks. It validates that both title and URL are provided, checks that the URL is valid using the URL constructor, then inserts into Supabase.
>
> **The BookmarkList** [show file] - Fetches and displays bookmarks. It uses useEffect to subscribe to real-time changes and clean up the subscription when the component unmounts. Each bookmark shows the favicon, title, URL, date, and has open and delete buttons.
>
> **The Supabase clients** [show lib folder] - I created separate clients for browser and server using the `@supabase/ssr` package, which handles cookie-based session management properly for Next.js App Router."

---

## Conclusion (30 seconds)

> "To summarize, I built a complete bookmark manager with:
> - Google OAuth authentication via Supabase
> - Row Level Security for user privacy
> - Real-time updates using WebSocket subscriptions
> - A clean, responsive UI with Tailwind CSS
>
> The app is ready to deploy to Vercel - just add the environment variables and update the OAuth redirect URL.
>
> Thanks for watching! Let me know if you have any questions."

---

## Quick Tips for Recording

- **Screen recording**: Use Loom, OBS, or QuickTime to capture your screen while you talk
- **Show code**: Have VS Code open with the files ready to scroll through
- **Keep energy up**: Speak clearly and at a moderate pace
- **Time check**: This script is approximately 5 minutes at normal speaking pace
- **Practice once**: Do a dry run to get comfortable with the flow
