# 🔖 Smart Bookmarks

A full-stack bookmark manager that lets you **save, organize, and sync bookmarks in real time** across all your devices. Built with modern web technologies and powered by Supabase for authentication and real-time data sync.

> **Live and responsive** — changes made on one tab or device appear instantly everywhere else, no refresh needed.

---

## ✨ Features

- **Google OAuth Login** — One-click sign in with Google via Supabase Auth
- **Add & Delete Bookmarks** — Save any URL with a title, remove it when you're done
- **Real-Time Sync** — Bookmarks update live across browser tabs using Supabase Realtime (Postgres Changes)
- **Protected Routes** — Server-side authentication guards prevent unauthorized access to the dashboard

---

## 🛠️ Tech Stack

| Layer            | Technology                                                                 |
| ---------------- | -------------------------------------------------------------------------- |
| **Framework**    | [Next.js 16](https://nextjs.org/) (App Router)                            |
| **UI Library**   | [React 19](https://react.dev/)                                            |
| **Language**     | [TypeScript 5](https://www.typescriptlang.org/)                           |
| **Styling**      | [Tailwind CSS 4](https://tailwindcss.com/) + CSS Custom Properties        |
| **Backend/DB**   | [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)            |
| **Auth**         | [Supabase SSR](https://www.npmjs.com/package/@supabase/ssr) (cookie-based sessions) |
| **Icons**        | [Lucide React](https://lucide.dev/)                                       |
| **Font**         | [Geist](https://vercel.com/font) (via `next/font`)                       |

---

## 📁 Project Structure

```
smart-bookmark-app/
├── app/
│   ├── auth/
│   │   ├── callback/route.ts    # OAuth callback — exchanges code for session
│   │   └── signout/route.ts     # Sign-out route — clears session & redirects
│   ├── dashboard/
│   │   ├── page.tsx             # Server Component — auth guard for dashboard
│   │   └── dashboard-content.tsx# Client Component — bookmark form + list
│   ├── globals.css              # Design tokens (light/dark) + Tailwind import
│   ├── layout.tsx               # Root layout with Geist font
│   ├── login-page.tsx           # Google login UI (Client Component)
│   └── page.tsx                 # Entry point — redirects logged-in users
├── components/
│   ├── BookmarkForm.tsx         # Add bookmark form with validation
│   └── BookmarkList.tsx         # Real-time bookmark list with delete
├── lib/
│   └── supabase/
│       ├── client.ts            # Browser Supabase client
│       └── server.ts            # Server Supabase client (cookie-based)
├── proxy.ts                     # Middleware for session token refresh
├── .env.local                   # Supabase URL + Anon Key (not committed)
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (or yarn / pnpm)
- A **Supabase** project ([create one for free](https://supabase.com/dashboard))

### 1. Clone the Repository

```bash
git clone https://github.com/Sumit-1011/smart-bookmark-app.git
cd Abstrabit
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project (or use an existing one).
2. Navigate to **Project Settings → API** and copy your **Project URL** and **anon/public key**.
3. Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Create the Database Table

Go to the **SQL Editor** in your Supabase Dashboard and run:

```sql
-- Create the bookmarks table
CREATE TABLE bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can only see their own bookmarks
CREATE POLICY "Users can view own bookmarks"
    ON bookmarks FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own bookmarks
CREATE POLICY "Users can insert own bookmarks"
    ON bookmarks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
    ON bookmarks FOR DELETE
    USING (auth.uid() = user_id);
```

### 5. Enable Google OAuth

1. In Supabase Dashboard, go to **Authentication → Providers → Google**.
2. Enable Google and add your **Client ID** and **Client Secret** (from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)).
3. Set the authorized redirect URI in Google Cloud to:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```


### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐛 Problems We Faced & How We Solved Them

### 1. Supabase Realtime Not Receiving Events

**Problem:** After adding a bookmark, the `BookmarkList` component did not update in real time on other tabs. The Supabase Realtime channel was subscribed, but no events came through.

**Root Cause:** Supabase Realtime requires an authenticated JWT to receive Postgres Changes on tables with Row Level Security (RLS) enabled. The client was subscribing to the channel _before_ setting the auth token.

**Solution:** We explicitly set the Realtime auth token from the user's session before subscribing to the channel, and also listen for auth state changes to keep the token fresh:

```typescript
const { data: { session } } = await supabase.auth.getSession()
if (session?.access_token) {
    supabase.realtime.setAuth(session.access_token)
}
// Then subscribe to the channel
```

---

## 📜 Available Scripts

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `npm run dev`    | Start development server           |
| `npm run build`  | Create production build            |
| `npm run start`  | Start production server            |
| `npm run lint`   | Run ESLint                         |

---

## 🧑‍💻 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

