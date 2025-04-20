-- Create tweet_like table
CREATE TABLE IF NOT EXISTS public.tweet_like (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    tweet_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_tweet FOREIGN KEY (tweet_id) REFERENCES public.tweets(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_tweet UNIQUE (user_id, tweet_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tweet_like_tweet_id ON public.tweet_like(tweet_id);
CREATE INDEX IF NOT EXISTS idx_tweet_like_user_id ON public.tweet_like(user_id);

-- Enable Row Level Security
ALTER TABLE public.tweet_like ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all likes"
    ON public.tweet_like
    FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own likes"
    ON public.tweet_like
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own likes"
    ON public.tweet_like
    FOR DELETE
    USING (auth.uid()::text = user_id); 