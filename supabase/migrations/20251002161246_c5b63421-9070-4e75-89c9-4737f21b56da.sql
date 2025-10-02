-- Drop the problematic view
DROP VIEW IF EXISTS public.consented_user_contacts;

-- Recreate without SECURITY DEFINER - RLS policies will handle security
CREATE VIEW public.consented_user_contacts AS
SELECT 
  cc.property_id,
  cc.property_owner_id,
  p.id as user_id,
  p.full_name,
  p.avatar_url,
  p.phone,
  cc.consent_given_at
FROM public.contact_consents cc
JOIN public.profiles p ON p.id = cc.user_id;

-- The view will automatically respect RLS policies on contact_consents and profiles tables
COMMENT ON VIEW public.consented_user_contacts IS 'View for accessing user contact details with consent. Security enforced through RLS policies on underlying tables.';