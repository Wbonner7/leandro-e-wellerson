-- Drop the overly permissive policy that allows everyone to view all profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a new policy that only allows users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow property owners to view profiles of users who expressed interest in their properties
CREATE POLICY "Property owners can view interested users profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.property_interests pi
    JOIN public.properties p ON p.id = pi.property_id
    WHERE pi.user_id = profiles.id
    AND p.owner_id = auth.uid()
  )
);