-- Add clay type and subtype columns to pieces table
ALTER TABLE public.pieces 
ADD COLUMN clay_type TEXT,
ADD COLUMN clay_subtype TEXT;