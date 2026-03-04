-- Add whatsapp_url to company_profiles for communities to link their WhatsApp group
ALTER TABLE public.company_profiles
  ADD COLUMN IF NOT EXISTS whatsapp_url text;
