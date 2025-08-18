-- Create pieces table with all fields including clay type and subtype
CREATE TABLE public.pieces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE,
  size_category TEXT,
  current_stage TEXT NOT NULL DEFAULT 'throwing',
  storage_location TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  technique_notes TEXT,
  description TEXT,
  next_step TEXT,
  next_reminder_at TIMESTAMP WITH TIME ZONE,
  stage_history JSONB DEFAULT '[]',
  history JSONB DEFAULT '[]',
  clay_type TEXT,
  clay_subtype TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pieces ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own pieces"
ON public.pieces
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pieces"
ON public.pieces
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pieces"
ON public.pieces
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pieces"
ON public.pieces
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pieces_updated_at
BEFORE UPDATE ON public.pieces
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create inspirations table
CREATE TABLE public.inspirations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  photos TEXT[] DEFAULT '{}',
  link_url TEXT,
  note TEXT,
  tags TEXT[] DEFAULT '{}',
  linked_piece_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for inspirations
ALTER TABLE public.inspirations ENABLE ROW LEVEL SECURITY;

-- Create policies for inspirations
CREATE POLICY "Users can view their own inspirations"
ON public.inspirations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inspirations"
ON public.inspirations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inspirations"
ON public.inspirations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inspirations"
ON public.inspirations
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for inspirations timestamp updates
CREATE TRIGGER update_inspirations_updated_at
BEFORE UPDATE ON public.inspirations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create piece_inspiration_links table
CREATE TABLE public.piece_inspiration_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  piece_id UUID NOT NULL REFERENCES public.pieces(id) ON DELETE CASCADE,
  inspiration_id UUID NOT NULL REFERENCES public.inspirations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(piece_id, inspiration_id)
);

-- Enable RLS for piece_inspiration_links
ALTER TABLE public.piece_inspiration_links ENABLE ROW LEVEL SECURITY;

-- Create policies for piece_inspiration_links
CREATE POLICY "Users can view their own links"
ON public.piece_inspiration_links
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own links"
ON public.piece_inspiration_links
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own links"
ON public.piece_inspiration_links
FOR DELETE
USING (auth.uid() = user_id);