
-- Add plan columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS pro_expires_at date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS upgrade_requested boolean NOT NULL DEFAULT false;

-- Create upgrade_requests table
CREATE TABLE public.upgrade_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text NOT NULL DEFAULT '',
  transaction_id text NOT NULL DEFAULT '',
  payment_method text NOT NULL DEFAULT '',
  screenshot_url text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  notes text NOT NULL DEFAULT ''
);

ALTER TABLE public.upgrade_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own upgrade requests" ON public.upgrade_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own upgrade requests" ON public.upgrade_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for upgrade screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('upgrade-screenshots', 'upgrade-screenshots', true);

-- Storage RLS: authenticated users can upload
CREATE POLICY "Authenticated users can upload screenshots"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'upgrade-screenshots');

CREATE POLICY "Anyone can view screenshots"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'upgrade-screenshots');
