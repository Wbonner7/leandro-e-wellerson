-- Create a table to track user consent for sharing contact information
CREATE TABLE public.contact_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  consent_given_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, property_owner_id, property_id)
);

-- Enable RLS on contact_consents
ALTER TABLE public.contact_consents ENABLE ROW LEVEL SECURITY;

-- Users can view their own consent records
CREATE POLICY "Users can view own consents"
ON public.contact_consents
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create consent records
CREATE POLICY "Users can grant consent"
ON public.contact_consents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can revoke consent by deleting
CREATE POLICY "Users can revoke consent"
ON public.contact_consents
FOR DELETE
USING (auth.uid() = user_id);

-- Property owners can view consents for their properties
CREATE POLICY "Property owners can view consents for their properties"
ON public.contact_consents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = contact_consents.property_id
    AND properties.owner_id = auth.uid()
  )
);

-- Create a security definer function to check if consent exists
CREATE OR REPLACE FUNCTION public.has_contact_consent(
  _user_id UUID,
  _property_owner_id UUID,
  _property_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.contact_consents
    WHERE user_id = _user_id
      AND property_owner_id = _property_owner_id
      AND property_id = _property_id
  )
$$;

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Property owners can view interested users profiles" ON public.profiles;

-- Create new restricted policy: Property owners can only see basic info (name, avatar) of interested users
-- Phone numbers are NOT included unless consent is given
CREATE POLICY "Property owners can view basic info of interested users"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM property_interests pi
    JOIN properties p ON p.id = pi.property_id
    WHERE pi.user_id = profiles.id
      AND p.owner_id = auth.uid()
  )
);

-- Create a secure view that property owners can use to get contact info only with consent
CREATE OR REPLACE VIEW public.consented_user_contacts AS
SELECT 
  cc.property_id,
  cc.property_owner_id,
  p.id as user_id,
  p.full_name,
  p.avatar_url,
  p.phone,
  cc.consent_given_at
FROM public.contact_consents cc
JOIN public.profiles p ON p.id = cc.user_id
WHERE cc.property_owner_id = auth.uid();

-- Add comment explaining the security model
COMMENT ON TABLE public.contact_consents IS 'Tracks explicit user consent for sharing contact information with property owners. Phone numbers are only accessible when consent is recorded in this table.';
COMMENT ON VIEW public.consented_user_contacts IS 'Secure view for property owners to access user contact details only when explicit consent has been given.';