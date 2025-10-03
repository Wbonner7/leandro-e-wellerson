-- Add new columns to property_interests for lead qualification
ALTER TABLE public.property_interests
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS income TEXT,
ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Create broker_reviews table
CREATE TABLE IF NOT EXISTS public.broker_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broker_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.broker_reviews ENABLE ROW LEVEL SECURITY;

-- Reviews are viewable by everyone
CREATE POLICY "Reviews are viewable by everyone" 
ON public.broker_reviews 
FOR SELECT 
USING (true);

-- Users can insert own reviews
CREATE POLICY "Users can insert own reviews" 
ON public.broker_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update own reviews
CREATE POLICY "Users can update own reviews" 
ON public.broker_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete own reviews
CREATE POLICY "Users can delete own reviews" 
ON public.broker_reviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on broker_reviews
CREATE TRIGGER update_broker_reviews_updated_at
BEFORE UPDATE ON public.broker_reviews
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();