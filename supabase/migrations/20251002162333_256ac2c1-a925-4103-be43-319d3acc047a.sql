-- Fix the security definer view by enabling security invoker mode
-- This ensures the view respects RLS policies of the querying user
ALTER VIEW public.consented_user_contacts SET (security_invoker = on);