-- Add subscription fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN plan TEXT DEFAULT 'free',
ADD COLUMN store TEXT,
ADD COLUMN original_transaction_id TEXT,
ADD COLUMN latest_expiration_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN subscription_status TEXT DEFAULT 'expired';