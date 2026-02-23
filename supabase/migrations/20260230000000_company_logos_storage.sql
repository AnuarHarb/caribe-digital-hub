-- Company logos storage bucket
-- Allows company owners/admins to upload logos for their companies

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- RLS: Only company owners/admins can upload to their company folder
DROP POLICY IF EXISTS "Company members can upload logo" ON storage.objects;
CREATE POLICY "Company members can upload logo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'company-logos' AND
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id::text = (storage.foldername(name))[1]
    AND cm.user_id = auth.uid()
    AND cm.role IN ('owner', 'admin')
  )
);

-- Anyone can view company logos (public bucket)
DROP POLICY IF EXISTS "Anyone can view company logos" ON storage.objects;
CREATE POLICY "Anyone can view company logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

-- Company owners/admins can update their logo
DROP POLICY IF EXISTS "Company members can update logo" ON storage.objects;
CREATE POLICY "Company members can update logo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'company-logos' AND
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id::text = (storage.foldername(name))[1]
    AND cm.user_id = auth.uid()
    AND cm.role IN ('owner', 'admin')
  )
);

-- Company owners/admins can delete their logo
DROP POLICY IF EXISTS "Company members can delete logo" ON storage.objects;
CREATE POLICY "Company members can delete logo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'company-logos' AND
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id::text = (storage.foldername(name))[1]
    AND cm.user_id = auth.uid()
    AND cm.role IN ('owner', 'admin')
  )
);
