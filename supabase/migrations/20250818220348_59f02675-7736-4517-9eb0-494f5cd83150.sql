-- Add address and notifications_enabled fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN address TEXT,
ADD COLUMN notifications_enabled BOOLEAN DEFAULT true;