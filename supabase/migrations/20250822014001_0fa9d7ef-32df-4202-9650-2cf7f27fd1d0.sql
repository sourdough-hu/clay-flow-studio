-- Fix critical security vulnerability: restrict profile data access
-- Remove the overly permissive "everyone can view profiles" policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a secure policy: users can only view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Optional: Create a policy for public display names only (if needed for user mentions/search)
-- This would require splitting sensitive data from public data in the future
-- For now, keeping everything private for maximum security