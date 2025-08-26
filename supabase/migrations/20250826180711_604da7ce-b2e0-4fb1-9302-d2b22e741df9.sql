-- Drop the current delete policy that only checks user_id
DROP POLICY IF EXISTS "link_delete" ON piece_inspiration_links;

-- Create the correct delete policy that allows delete if user owns either the piece OR inspiration
CREATE POLICY "link_delete" ON piece_inspiration_links
FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM pieces p WHERE p.id = piece_id AND p.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM inspirations i WHERE i.id = inspiration_id AND i.user_id = auth.uid())
);