# Supabase Setup Guide for Party Drinks App

This guide will help you set up the Supabase database for the Party Drinks app.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and create an account if you don't have one
2. Create a new project
3. Copy your project URL and API keys for later use

## 2. Configure Environment Variables

Create a `.env.local` file in the root of your project with the following content:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

Replace the placeholders with your actual Supabase credentials.

## 3. Set Up Database Tables

Run the following SQL in the Supabase SQL Editor to create all necessary tables:

```sql
-- Create users table
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  profile_image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create drink_points table (reference table for point values)
CREATE TABLE public.drink_points (
  drink_type TEXT PRIMARY KEY CHECK (drink_type IN ('Beer', 'Wine', 'Cocktail', 'Shot')),
  points INTEGER NOT NULL
);

-- Create drinks table
CREATE TABLE public.drinks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  drink_type TEXT REFERENCES public.drink_points(drink_type) NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create wins table
CREATE TABLE public.wins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create tweets table
CREATE TABLE public.tweets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 300),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create leaderboard view
CREATE VIEW public.leaderboard AS
WITH drink_totals AS (
  SELECT 
    user_id,
    SUM(points) as total_points
  FROM 
    drinks
  GROUP BY 
    user_id
),
win_totals AS (
  SELECT 
    user_id,
    SUM(count) as total_wins
  FROM 
    wins
  GROUP BY 
    user_id
)
SELECT 
  u.id as user_id,
  u.username,
  u.profile_image_url,
  COALESCE(dt.total_points, 0) AS total_points,
  COALESCE(ct.total_wins, 0) AS win_count
FROM 
  users u
LEFT JOIN 
  drink_totals dt ON u.id = dt.user_id
LEFT JOIN 
  win_totals ct ON u.id = ct.user_id;

-- Insert default drink point values
INSERT INTO public.drink_points (drink_type, points) VALUES
  ('Beer', 1),
  ('Wine', 2),
  ('Cocktail', 3),
  ('Shot', 2);
```

## 4. Set Up Row-Level Security Policies

Add the following policies to secure your tables:

```sql
-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drink_points ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users are viewable by everyone" 
  ON public.users FOR SELECT 
  USING (true);

CREATE POLICY "Users can only be inserted by service role" 
  ON public.users FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');

-- Drinks table policies
CREATE POLICY "Drinks are viewable by everyone" 
  ON public.drinks FOR SELECT 
  USING (true);

CREATE POLICY "Drinks can only be inserted by service role" 
  ON public.drinks FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');

-- wins table policies
CREATE POLICY "wins are viewable by everyone" 
  ON public.wins FOR SELECT 
  USING (true);

CREATE POLICY "wins can only be inserted by service role" 
  ON public.wins FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');

-- Tweets table policies
CREATE POLICY "Tweets are viewable by everyone" 
  ON public.tweets FOR SELECT 
  USING (true);

CREATE POLICY "Tweets can only be inserted by service role" 
  ON public.tweets FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');

-- Drink points table policies
CREATE POLICY "Drink points are viewable by everyone" 
  ON public.drink_points FOR SELECT 
  USING (true);
```

## 5. Storage Setup

### 5.1 Create Storage Buckets Manually

1. Go to the Storage section in your Supabase dashboard
2. Create a new bucket called `profile-images` for user profile pictures:
   - Click "Create Bucket"
   - Enter name: `profile-images`
   - Check "Public bucket" to make files publicly accessible
   - Set file size limit: 2MB
   - Click "Create bucket" button

3. Create a new bucket called `tweet-images` for tweet images:
   - Click "Create Bucket"
   - Enter name: `tweet-images`
   - Check "Public bucket" to make files publicly accessible
   - Set file size limit: 5MB
   - Click "Create bucket" button

### 5.2 Set Up Storage Policies

Run the following SQL to set up storage policies:

```sql
-- Allow public read access to profile images
CREATE POLICY "Profile images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-images');

-- Allow public upload access to profile images
CREATE POLICY "Anyone can upload profile images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-images');

-- Allow public read access to tweet images
CREATE POLICY "Tweet images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tweet-images');

-- Allow public upload access to tweet images
CREATE POLICY "Anyone can upload tweet images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tweet-images');
```

### 5.3 Automatic Bucket Creation via API

Alternatively, you can initialize storage buckets programmatically by making a GET request to the following endpoint after starting your application:

```
GET /api/init-storage
```

This endpoint uses the `ensureStorageBuckets` function from `lib/storage.ts` to create the required buckets if they don't exist.

## 6. Testing the Setup

You can test your setup by running the following functions from `lib/db.ts`:

- `createUser` - to register a new user
- `