-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can create their own links" ON piece_inspiration_links;
DROP POLICY IF EXISTS "Users can delete their own links" ON piece_inspiration_links;

-- Create improved RLS policies for piece_inspiration_links
-- Allow insert if user owns both the piece and inspiration
CREATE POLICY "link_insert" ON piece_inspiration_links
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (SELECT 1 FROM pieces p WHERE p.id = piece_id AND p.user_id = auth.uid())
  AND EXISTS (SELECT 1 FROM inspirations i WHERE i.id = inspiration_id AND i.user_id = auth.uid())
);

-- Allow delete if user owns the link (since user_id is stored in the link)
CREATE POLICY "link_delete" ON piece_inspiration_links
FOR DELETE 
USING (auth.uid() = user_id);

-- Keep the existing select policy
-- Users can view their own links is already working correctly