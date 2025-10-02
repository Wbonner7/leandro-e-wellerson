-- Phase 2: Database Integrity Constraints
-- Add length constraints and NOT NULL where needed
ALTER TABLE public.property_interests 
  ALTER COLUMN message TYPE VARCHAR(1000);

ALTER TABLE public.property_reports 
  ALTER COLUMN description TYPE VARCHAR(1000);

ALTER TABLE public.property_reviews 
  ALTER COLUMN comment TYPE VARCHAR(1000),
  ALTER COLUMN rating SET NOT NULL;

ALTER TABLE public.property_visits 
  ALTER COLUMN notes TYPE VARCHAR(500);

-- Add CHECK constraint for rating
ALTER TABLE public.property_reviews 
  ADD CONSTRAINT rating_range CHECK (rating >= 1 AND rating <= 5);

-- Phase 2: Fix View Counter Race Condition
-- Create atomic increment function
CREATE OR REPLACE FUNCTION public.increment_property_views(property_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.properties
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = property_uuid
  RETURNING views_count INTO new_count;
  
  RETURN COALESCE(new_count, 0);
END;
$$;

-- Phase 3: Storage Bucket Configuration
-- Update property-images bucket with size and MIME type restrictions
UPDATE storage.buckets
SET 
  file_size_limit = 5242880, -- 5MB in bytes
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'property-images';

-- Phase 3: Add missing UPDATE policies for property_images
CREATE POLICY "Property owners can update images"
ON public.property_images
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM properties
    WHERE properties.id = property_images.property_id
    AND properties.owner_id = auth.uid()
  )
);

-- Add UPDATE policy for property_interests (allow users to update their own)
CREATE POLICY "Users can update own interests"
ON public.property_interests
FOR UPDATE
USING (auth.uid() = user_id);