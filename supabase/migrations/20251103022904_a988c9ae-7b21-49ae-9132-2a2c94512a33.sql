-- Create property_analytics table
CREATE TABLE IF NOT EXISTS public.property_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  duration_seconds INTEGER,
  device_type TEXT,
  referrer TEXT,
  city TEXT,
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_property ON public.property_analytics(property_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON public.property_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON public.property_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON public.property_analytics(user_id);

-- Enable RLS
ALTER TABLE public.property_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Property owners can view their property analytics"
ON public.property_analytics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = property_analytics.property_id 
    AND properties.owner_id = auth.uid()
  )
);

CREATE POLICY "Anyone can insert analytics for tracking"
ON public.property_analytics FOR INSERT
WITH CHECK (true);